const LRUCache = require("lru-cache");
const { ax, promiseTry } = require("./utils");

const LRU_CACHE_SIZE = 200;
const LRU_CACHE_TTL = 24 * 60 * 60000;

async function sendRequest(params) {
	const { data } = await ax(process.env.GUILLEFIX_ENDPOINT, {
		params,
		timeout: 1000
	});

	const hits = [];
	for(let s of data.trim().split("|,")) {
		const parts = s.split("|");
		if(parts.length !== 5)
			continue;
		hits.push({
			recordType: "object",
			thumbnailUri: parts[0],
			assetUri: parts[1],
			name: parts[2],
			ownerName: parts[3],
			path: parts[4],
		});
	}
	return hits;
}

const requestCache = new LRUCache({ max: LRU_CACHE_SIZE, ttl: LRU_CACHE_TTL });

async function searchRecordsCached(params, size = Infinity, from = 0) {
	const cacheKey = JSON.stringify(["q", "f", "t", "i",].map(k => params[k]));

	let hits = requestCache.get(cacheKey);
	if(!hits) {
		hits = await sendRequest(params);
		requestCache.set(cacheKey, hits);
	}

	return { total: hits.length, hits: hits.slice(from, size) };
}

module.exports = { searchRecordsCached };
