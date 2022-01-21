const _ = require("underscore");

const { writeAnimX } = require("./animx");
const { getRecordUri } = require("./cloudx");

const JSON_FIELDS = [
	"_id", "_score", "ownerId", "ownerName", "id", "name", "tags",
	"recordType", "objectType", "type", "path", "assetUri", "spawnUri", "spawnParentUri", "thumbnailUri",
];

const ANIMJ_FIELDS = [
	"ownerName", "name", "type", "path", "spawnUri", "spawnParentUri", "thumbnailUri"
];

const LINK_ENDPOINT_VERSION = 2;

function buildFulltextQuery(q) {
	if(!q)
		return null;
	return {
		dis_max: {
			queries: [
				{ match: { simpleName: { query: String(q), fuzziness: "AUTO", boost: 2 }}},
				{ match: { ownerPathNameSearchable: { query: String(q), fuzziness: "AUTO", boost: 2 } }},
				{ match: { tagsSearchable: { query: String(q), fuzziness: "AUTO", boost: 1 } }}
			],
			tie_breaker: 0.7
		}
	};
}

function processLocalHits(hits, baseUrl) {
	for(let rec of hits) {
		rec.type = rec.recordType === "object" ? rec.objectType : rec.recordType;
		if(rec.recordType === "directory")
			rec.spawnUri = `${baseUrl}/link.bson?target=${encodeURIComponent(getRecordUri(rec))}&targetName=${encodeURIComponent(rec.name)}&v=${encodeURIComponent(LINK_ENDPOINT_VERSION)}`;
		else if(rec.recordType === "link")
			rec.spawnUri = `${baseUrl}/link.bson?target=${encodeURIComponent(rec.assetUri)}&targetName=${encodeURIComponent(rec.name)}&v=${encodeURIComponent(LINK_ENDPOINT_VERSION)}`;
		else if(rec.recordType === "object")
			rec.spawnUri = rec.assetUri;
		else
			rec.spawnUri = null;
		if(rec.recordType !== "world")
			rec.spawnParentUri = `${baseUrl}/parent-link.bson?ownerId=${encodeURIComponent(rec.ownerId)}&id=${encodeURIComponent(rec.id)}&v=${encodeURIComponent(LINK_ENDPOINT_VERSION)}`;
		else
			rec.spawnParentUri = null;
	}
}

function sendHits(res, format, v, total, hits) {
	if(format === "json")
		return res.json({
			total, v,
			hits: hits.map(h => _.pick(h, JSON_FIELDS))
		});

	hits.push({}); // terminator

	let animjTracks = [
		{
			trackType: "Discrete",
			valueType: "int",
			data: {
				node: "_meta",
				property: "v",
				keyframes: [
					{ time: 0, value: v }
				]
			}
		},
		{
			trackType: "Discrete",
			valueType: "int",
			data: {
				node: "_meta",
				property: "total",
				keyframes: [
					{ time: 0, value: total }
				]
			}
		},
		...ANIMJ_FIELDS.map(f => {
			return {
				trackType: "Discrete",
				valueType: "string",
				data: {
					node: "hits",
					property: f,
					keyframes: _.map(hits, (h, time) => ({
						time, value: h[f] || null
					}))
				}
			}
		})
	];

	let animj = {
		name: "response",
		globalDuration: Math.max(hits.length, 1),
		tracks: animjTracks
	};

	if(format === "animj")
		return res.json(animj);

	res.send(writeAnimX(animj));
}

module.exports = {
	LINK_ENDPOINT_VERSION,
	buildFulltextQuery,
	processLocalHits,
	sendHits,
};
