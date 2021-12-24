const _ = require("underscore"),
	{ Client } = require('@elastic/elasticsearch');

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
	if(rec.name === undefined)
		rec.name = "";
	if(rec.path === undefined)
		rec.path = "";

	rec.simpleName = stripRichText(rec.name).slice(0, 2000);
	rec.name = rec.name.slice(0, 8000);
	rec.ownerName = rec.ownerName.slice(0, 500);

	let parts = [];
	for(let p of rec.path.split("\\")) {
		p = stripRichText(p).slice(0, 48);
		if(p === "" || p === "Inventory")
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
				{ term: { ownerId: String(rec.ownerId) }},
				{ term: { path: String(`${rec.path}\\${rec.name}`) }}
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

function getRecord(ownerId, id, includePending=false) {
	return client.search({
		index: RECORDS_IDX,
		body: {
			query: buildExactRecordQuery(ownerId, id),
			size: 1
		}
	}).then(getHits).then(_.first).then(rec => {
		if(rec || !includePending)
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

function searchRecords(query, size=10, from=0, extraBody={}, extraParams={}) {
	return client.search({
		index: RECORDS_IDX,
		body: {
			query,
			size, from,
			...extraBody
		},
		...extraParams
	}).then(({ body }) => {
		let hits = body.hits;
		return {
			total: hits.total.value,
			max_score: hits.max_score,
			hits: hits.hits.map(({ _id, _score, _source }) => {
				return _.extend(_source, { _id, _score });
			})
		};
	});
}

function searchPendingRecords(query, size=10, from=0, extraBody={}, extraParams={}) {
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
