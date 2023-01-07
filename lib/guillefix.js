const LRUCache = require("lru-cache");
const Promise = require("bluebird");
const { ax } = require("./utils");

const LRU_CACHE_SIZE = 200;
const LRU_CACHE_TTL = 24*60*60000;

function sendRequest(params) {
	return ax(process.env.GUILLEFIX_ENDPOINT, {
		params,
		timeout: 1000
	}).then(({ data }) => {
		let hits = [];
		for(let s of data.trim().split("|,")) {
			let parts = s.split("|");
			if(parts.length !== 5)
				continue;
			let rec = {
				recordType: "object",
				thumbnailUri: parts[0],
				assetUri: parts[1],
				name: parts[2],
				ownerName: parts[3],
				path: parts[4],
			};

			hits.push(rec);
		}
		return hits;
	});
}

const requestCache = new LRUCache({ max: LRU_CACHE_SIZE, ttl: LRU_CACHE_TTL });

function searchRecordsCached(params, size=Infinity, from=0) {
	let cacheKey = JSON.stringify(["q","f","t","i",].map(k => params[k]));

	return Promise.try(() => {
		console.log(cacheKey);
		if(requestCache.get(cacheKey))
			return Promise.resolve(requestCache.get(cacheKey));

		return Promise.resolve(sendRequest(params)).tap(hits => requestCache.set(cacheKey, hits));
	}).then(hits => {
		let total = hits.length;
		hits = hits.slice(from, size);

		return { total, hits };
	});
}

module.exports = { searchRecordsCached };
