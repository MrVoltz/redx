const _ = require("underscore");
const { Client } = require('@elastic/elasticsearch');
const assert = require("assert");

const client = new Client({
	node: process.env.ES_NODE,
	auth: {
		username: process.env.ES_USERNAME,
		password: process.env.ES_PASSWORD
	}
});

const PENDING_RECORDS_IDX = "pending-records",
	RECORDS_IDX = "records",
	MAX_SIZE = 10000;

function getHits({ body }) {
	return _.pluck(body.hits.hits, "_source");
}

function stripRichText(str) {
	return str.replace(/<([^>]*)>/g, "").trim();
}

function sanitizeRecord(rec) {
	if (rec.name === undefined)
		rec.name = "";
	if (rec.path === undefined)
		rec.path = "";

	rec.simpleName = stripRichText(rec.name).slice(0, 2000);
	rec.name = rec.name.slice(0, 8000);
	rec.ownerName = rec.ownerName.slice(0, 500);

	let parts = [];
	for (let p of rec.path.split("\\")) {
		p = stripRichText(p).slice(0, 48);
		if (p === "" || p === "Inventory")
			continue;
		parts.push(p);
	}
	rec.pathNameSearchable = parts.join(" ").slice(0, 2000) + " " + rec.simpleName;
	rec.ownerPathNameSearchable = rec.ownerName + " " + rec.pathNameSearchable;

	rec.tagsSearchable = rec.tags.join(" ").slice(0, 8000);

	delete rec.neosDBmanifest;
	delete rec.inventoryLinkUris;
	// delete rec.componentSimpleTypes;

	// searchRecords
	delete rec._id;
	delete rec._score;

	return rec;
}

function buildExactRecordQuery(ownerId, id) {
	return {
		bool: {
			filter: [
				{ term: { ownerId: String(ownerId) } },
				{ term: { id: String(id) } },
			]
		}
	};
}

function buildChildrenQuery(rec) {
	return {
		bool: {
			filter: [
				{ term: { ownerId: String(rec.ownerId) } },
				{ term: { path: String(`${rec.path}\\${rec.name}`) } }
			]
		}
	};
}

function indexPendingRecord(rec) {
	return client.index({
		index: PENDING_RECORDS_IDX,
		body: sanitizeRecord(rec)
	});
}

function getRecord(ownerId, id, includePending = false) {
	return client.search({
		index: RECORDS_IDX,
		body: {
			query: buildExactRecordQuery(ownerId, id),
			size: 1
		}
	}).then(getHits).then(_.first).then(rec => {
		if (rec || !includePending)
			return rec;

		return client.search({
			index: PENDING_RECORDS_IDX,
			body: {
				query: buildExactRecordQuery(ownerId, id)
			}
		}).then(getHits).then(_.first);
	});
}

function getSomePendingRecords(size) {
	return client.search({
		index: PENDING_RECORDS_IDX,
		body: {
			query: {
				match_all: {}
				// terms: { recordType: ["world"] }
				// terms: { recordType: ["link","directory","world"] }
				// terms: { recordType: ["object"] }
			},
			size
		}
	}).then(getHits);
}

function deleteRecord(ownerId, id) {
	return client.deleteByQuery({
		index: RECORDS_IDX,
		refresh: true,
		body: {
			query: buildExactRecordQuery(ownerId, id),
		}
	});
}

function deletePendingRecord(ownerId, id) {
	return client.deleteByQuery({
		index: PENDING_RECORDS_IDX,
		refresh: true,
		body: {
			query: buildExactRecordQuery(ownerId, id),
		}
	});
}

function indexRecord(rec) {
	return client.index({
		index: RECORDS_IDX,
		body: sanitizeRecord(rec)
	});
}

function searchRecordsPit(query, size = 10, from = 0, extraBody = {}, extraParams = {}) {
	assert.equal(from, 0);

	const index = extraParams.index || RECORDS_IDX;
	delete extraParams.index;

	let pitId, searchAfter, maxScore = 0, allHits = [];
	function nextPage() {
		if (allHits.size >= size)
			return Promise.resolve();

		return client.search({
			body: {
				query,
				size: Math.min(MAX_SIZE, size - allHits.length),
				from,
				pit: {
					id: pitId,
					keep_alive: "30s"
				},
				search_after: searchAfter,
				track_total_hits: false,
				sort: [
					{ "_shard_doc": "asc" }
				],
				...extraBody
			},
			...extraParams
		}).then(({ body }) => {
			const hits = body.hits;
			maxScore = Math.max(maxScore, hits.max_score);
			allHits = allHits.concat(hits.hits.map(({ _id, _score, _source }) => {
				return _.extend(_source, { _id, _score });
			}));
			pitId = body.pit_id;
			if (!hits.hits.length)
				return;
			searchAfter = hits.hits[hits.hits.length - 1].sort;
			return nextPage();
		});
	}
	return client.openPointInTime({
		index,
		keep_alive: "30s"
	}).then(({ body }) => {
		pitId = body.id;
		return nextPage();
	}).finally(() => {
		if (!pitId)
			return;
		return client.closePointInTime({
			body: {
				id: pitId
			}
		})
	}).then(() => {
		return {
			total: allHits.length,
			max_score: maxScore,
			hits: allHits
		};
	});
}

function searchRecords(query, size = 10, from = 0, extraBody = {}, extraParams = {}) {
	if (size > MAX_SIZE)
		return searchRecordsPit(query, size, from, extraBody, extraParams);

	return client.search({
		index: RECORDS_IDX,
		body: {
			query,
			size, from,
			...extraBody
		},
		...extraParams
	}).then(({ body }) => {
		const hits = body.hits;
		return {
			total: hits.total.value,
			max_score: hits.max_score,
			hits: hits.hits.map(({ _id, _score, _source }) => {
				return _.extend(_source, { _id, _score });
			})
		};
	});
}

function searchPendingRecords(query, size = 10, from = 0, extraBody = {}, extraParams = {}) {
	return searchRecords(query, size, from, extraBody, {
		index: PENDING_RECORDS_IDX,
		...extraParams
	});
}

module.exports = {
	MAX_SIZE,
	client,
	buildChildrenQuery,
	indexPendingRecord, getRecord, getSomePendingRecords, deleteRecord, deletePendingRecord, indexRecord, searchRecords, searchPendingRecords
};
