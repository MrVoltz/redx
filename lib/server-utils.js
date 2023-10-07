const _ = require("underscore");

const { writeAnimX } = require("./animx");
const { getRecordUri } = require("./cloudx");

const JSON_FIELDS = [
	"_id", "_score", "ownerId", "ownerName", "id", "name", "tags",
	"recordType", "objectType", "type", "path", "assetUri", "spawnUri", "spawnParentUri", "thumbnailUri", "browseUri", "browseParentUri",
];

const ANIMJ_FIELDS = [
	"ownerName", "name", "type", "path", "spawnUri", "spawnParentUri", "thumbnailUri", "browseUri", "browseParentUri",
];

const META_FIELD_TYPES = {
	v: "int",
	total: "int",
	modalTitle: "string",
	spawnUri: "string",
};

const LINK_ENDPOINT_VERSION = 2;

function buildFulltextQuery(q, imageSearchHits = [], imageSearchWeight = 0) {
	if(!q)
		return null;

	const minImageSearchBoost = 2,
		maxImageSearchBoost = 20;

	let imageSearchBoost = minImageSearchBoost + imageSearchWeight * (maxImageSearchBoost - minImageSearchBoost);

	// console.log(imageSearchHits, imageSearchWeight);

	return {
		dis_max: {
			queries: [
				{ match: { simpleName: { query: String(q), fuzziness: "AUTO", boost: 2 } } },
				{ match: { ownerPathNameSearchable: { query: String(q), fuzziness: "AUTO", boost: 2 } } },
				{ match: { tagsSearchable: { query: String(q), fuzziness: "AUTO", boost: 1 } } },
				...(imageSearchHits.length && imageSearchWeight > 0 ? [
					{ terms: { thumbnailUri: imageSearchHits.map(hit => String(hit.thumbnailUri + ".webp")), boost: imageSearchBoost } }
				] : [])
			],
			tie_breaker: 0.7
		}
	};
}

function processLocalHits(hits, buildUrl, format, hist = []) {
	for(let rec of hits) {
		rec.type = rec.recordType === "object" ? rec.objectType : rec.recordType;
		if(rec.recordType === "directory")
			rec.spawnUri = buildUrl("link", {
				target: getRecordUri(rec),
				targetName: rec.name,
				v: LINK_ENDPOINT_VERSION
			}, true);
		else if(rec.recordType === "link")
			rec.spawnUri = buildUrl("link", {
				target: rec.assetUri,
				targetName: rec.name,
				v: LINK_ENDPOINT_VERSION
			}, true);
		else if(rec.recordType === "object")
			rec.spawnUri = rec.assetUri;
		else
			rec.spawnUri = null;
		if(["directory", "link", "object"].includes(rec.recordType)) {
			rec.spawnParentUri = buildUrl("parent-link", {
				ownerId: rec.ownerId,
				id: rec.id,
				v: LINK_ENDPOINT_VERSION
			}, true);
			rec.browseParentUri = buildUrl("browse-parent", {
				format,
				ownerId: rec.ownerId,
				id: rec.id,
				hist,
			}, true);
		} else {
			rec.spawnParentUri = null;
			rec.browseParentUri = null;
		}
		if(rec.recordType === "directory" || rec.recordType === "link")
			rec.browseUri = buildUrl("browse", {
				format,
				ownerId: rec.ownerId,
				id: rec.id,
				hist,
			}, true);
		else
			rec.browseUri = rec.browseUri || null;
	}
}

function sendAnimjTracks(res, format, animjTracks) {
	const animj = {
		name: "response",
		globalDuration: Math.max(_.max(animjTracks, track => _.max(track.data.keyframes, f => f.time)), 0) + 1,
		tracks: animjTracks
	};

	if(format === "animj")
		return res.json(animj);

	res.send(writeAnimX(animj));
}

function createDiscreteTrack(valueType, node, property, values) {
	return {
		trackType: "Discrete",
		valueType,
		data: {
			node,
			property,
			keyframes: _.map(values, (value, time) => ({
				time, value
			}))
		}
	};
}

function sendSearchResponse(res, format, hits, meta = {}) {
	if(format === "json")
		return res.json({
			...meta,
			hits: hits.map(h => _.pick(h, JSON_FIELDS)),
		});

	hits.push({}); // terminator

	const animjTracks = [
		_.map(meta, (value, key) => createDiscreteTrack(META_FIELD_TYPES[key], "_meta", key, [value])),
		ANIMJ_FIELDS.map(f => createDiscreteTrack("string", "hits", f, hits.map(h => h[f] || null))),
	].flat();

	sendAnimjTracks(res, format, animjTracks);
}

function sendBrowseResponse(res, format, hits, hist, meta = {}) {
	if(format === "json")
		return res.json({
			...meta,
			hist,
			hits: hits.map(h => _.pick(h, JSON_FIELDS)),
		});

	hist.push({}); // terminator
	hits.push({}); // terminator

	const animjTracks = [
		_.map(meta, (value, key) => createDiscreteTrack(META_FIELD_TYPES[key], "_meta", key, [value])),
		["name", "browseUri"].map(f => createDiscreteTrack("string", "hist", f, hist.map(h => h[f] || null))),
		ANIMJ_FIELDS.map(f => createDiscreteTrack("string", "hits", f, hits.map(h => h[f] || null))),
	].flat();

	sendAnimjTracks(res, format, animjTracks);
}

module.exports = {
	LINK_ENDPOINT_VERSION,
	buildFulltextQuery,
	processLocalHits,
	sendSearchResponse, sendBrowseResponse,
};
