const _ = require("underscore");

const { writeAnimX } = require("../lib/animx");

const JSON_FIELDS = [
	"_id", "_score", "ownerId", "ownerName", "id", "name", "tags",
	"recordType", "objectType", "type", "path", "assetUri", "spawnUri", "spawnParentUri", "thumbnailUri",
];

const ANIMJ_FIELDS = [
	"ownerName", "name", "type", "path", "spawnUri", "spawnParentUri", "thumbnailUri"
];

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

module.exports = { sendHits };
