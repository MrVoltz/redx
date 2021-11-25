const fs = require("fs"),
	path = require("path"),
	fsPromises = require("fs/promises");

const { streamAsset } = require("./cloudx");

const NEOSDB_DIR = __dirname + "/../cache";

function streamAssetCached(id, ext) {
	let cacheDir = path.join(NEOSDB_DIR, id.slice(0, 2)),
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
	streamAssetCached
};
