const fs = require("fs");
const path = require("path");
const fsPromises = require("fs/promises");
const LRUCache = require("lru-cache");

const { streamAsset, fetchRecord, getRecordUri, isPermanentHttpError } = require("./cloudx");

const ASSET_CACHE_DIR = __dirname + "/../cache";

const LRU_CACHE_SIZE = 200;
const LRU_CACHE_TTL = 24 * 60 * 60000;

const recordCache = new LRUCache({ max: LRU_CACHE_SIZE, ttl: LRU_CACHE_TTL });

function fetchRecordCached(recordStub) {
	const cacheKey = getRecordUri(recordStub);

	const cachedPromise = recordCache.get(cacheKey);
	if(cachedPromise)
		return cachedPromise;

	// TODO: cache pending promise

	return fetchRecord(recordStub).tap(record => {
		recordCache.set(cacheKey, Promise.resolve(record));
	}).catch(err => {
		if(isPermanentHttpError(err))
			recordCache.set(cacheKey, Promise.reject(err));
		throw err;
	});
}

function streamAssetCached(id, ext) {
	let cacheDir = path.join(ASSET_CACHE_DIR, id.slice(0, 2)),
		cacheFile = path.join(cacheDir, id + "." + ext);

	function handleCacheMiss() {
		console.log(`streamAssetCached cache miss ${id}.${ext}`);
		return fsPromises.mkdir(cacheDir).catch(err => {
			if(err.code !== "EEXIST")
				throw err;
		}).then(() => {
			return streamAsset(id);
		}).then(assetStream => {
			let writeStream = fs.createWriteStream(cacheFile);
			assetStream.pipe(writeStream);

			// TODO: error handling for writeStream

			return assetStream;
		});
	}

	return fsPromises.stat(cacheFile).then((stat) => {
		if(stat.size === 0)
			return handleCacheMiss();

		return fs.createReadStream(cacheFile);
	}).catch(err => {
		if(err.code !== "ENOENT")
			throw err;
		return handleCacheMiss();
	});
}

module.exports = {
	streamAssetCached,
	fetchRecordCached,
};
