require("dotenv").config();

const Promise = require("bluebird"),
	fsPromises = require("fs/promises"),
	fs = require("fs"),
	path = require("path"),
	_ = require("underscore");

const cloudx = require("../lib/cloudx"),
	db = require("../lib/db"),
	{ describeRecord, describeObject, describeWorld } = require("../lib/objectdescriber"),
	{ readPackedObject } = require("../lib/objectloader");

const CONCURRENCY = 2,
	BATCH_SIZE = 16,
	NEOSDB_DIR = __dirname + "/../cache";

function recordToString(rec) {
	return `[${rec.recordType}] neosrec:///${rec.ownerId}/${rec.id} (${rec.path}\\${rec.name})`;
}

function streamAssetCached(id, ext) {
	let cacheDir = path.join(NEOSDB_DIR, id.slice(0, 2)),
		cacheFile = path.join(cacheDir, id + "." + ext);

	function handleCacheMiss() {
		return fsPromises.mkdir(cacheDir).catch(err => {
			if(err.code !== "EEXIST")
				throw err;
		}).then(() => {
			return cloudx.streamAsset(id);
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

		console.log(`streamAssetCached ${id}.${ext} using cache`);
		return fs.createReadStream(cacheFile);
	}).catch(err => {
		if(err.code !== "ENOENT")
			throw err;
		return handleCacheMiss();
	});
}

function fetchAndIndexRecord(uri) {
	let { ownerId, id } = cloudx.parseRecordUri(uri);
	return db.getRecord(ownerId, id, true).then(localRec => {
		if(localRec) {
			// console.log(`fetchAndIndexRecord ${recordToString(localRec)} already indexed`);
			return;
		}

		return cloudx.fetchRecord(ownerId, id).then(rec => {
			console.log(`fetchAndIndexRecord ${recordToString(rec)}`);
			return db.indexPendingRecord(rec);
		}).catch(err => {
			if(err.response && [403, 404].indexOf(err.response.status) !== -1) {
				console.log(`fetchAndIndexRecord ${uri} ${err.response.status}`);
				return;
			}

			throw err;
		});
	});
}

function indexRecordUris(uris) {
	return Promise.map(uris, fetchAndIndexRecord, { concurrency: CONCURRENCY });
}

function maybeIndexPendingRecord(rec) {
	return db.getRecord(rec.ownerId, rec.id, true).then(localRec => {
		if(localRec) {
			// console.log(`maybeIndexPendingRecord ${recordToString(localRec)} already indexed`);
			return;
		}

		// console.log(`maybeIndexPendingRecord ${recordToString(rec)}`);
		return db.indexPendingRecord(rec);
	});
}

function indexDirectoryRecord(rec) {
	return cloudx.fetchDirectoryChildren(rec).map(childRec => {
		return maybeIndexPendingRecord(childRec);
	}).then(() => {
		return db.indexRecord(rec);
	});
}

function indexLinkRecord(rec) {
	return fetchAndIndexRecord(rec.assetUri).then(() => {
		return db.indexRecord(rec);
	});
}

function indexObjectRecord(rec) {
	return Promise.try(() => {
		let desc = describeRecord(rec);
		if(desc.objectType) { // have enough info in record
			console.log(`indexObjectRecord ${recordToString(rec)} description`, desc);
			return _.extend(rec, desc);
		}

		let assetUri = cloudx.parseUri(rec.assetUri);
		if(assetUri.protocol !== "neosdb:") { // don't fetch external assets
			console.log(`indexObjectRecord ${recordToString(rec)} skipping external assetUri ${rec.assetUri}`);
			return rec;
		}

		console.log(`indexObjectRecord ${recordToString(rec)} streaming ${rec.assetUri}`);
		let { id, ext } = cloudx.parseAssetUri(assetUri);
		return streamAssetCached(id, ext).then(stream => {
			return readPackedObject(stream, ext).catch(err => {
				console.log(`indexObjectRecord ${recordToString(rec)} corrupted object ${err.message || err}`);
				return null;
			});
		}).then(obj => {
			if(!obj)
				return rec;
			let desc = describeObject(obj);
			console.log(`indexObjectRecord ${recordToString(rec)} description`, desc);
			return _.extend(rec, desc);
		});
	}).tap((rec) => {
		if(rec.worldUri)
			return fetchAndIndexRecord(rec.worldUri);
	}).tap((rec) => {
		if(rec.inventoryLinkUris)
			return indexRecordUris(rec.inventoryLinkUris);
	}).then((rec) => {
		return db.indexRecord(rec);
	});
}

function indexWorldRecord(rec) {
	return Promise.try(() => {
		let assetUri = cloudx.parseUri(rec.assetUri);
		if(assetUri.protocol !== "neosdb:") { // don't fetch external assets
			console.log(`indexWorldRecord ${recordToString(rec)} skipping external assetUri ${rec.assetUri}`);
			return rec;
		}

		console.log(`indexWorldRecord ${recordToString(rec)} streaming ${rec.assetUri}`);
		let { id, ext } = cloudx.parseAssetUri(assetUri);
		return streamAssetCached(id, ext).then(stream => {
			return readPackedObject(stream, ext).catch(err => {
				console.log(`indexWorldRecord ${recordToString(rec)} corrupted world ${err.message || err}`);
				return null;
			});
		}).then(obj => {
			if(!obj)
				return rec;
			let desc = describeWorld(obj);
			console.log(`indexWorldRecord ${recordToString(rec)} description`, desc);
			return _.extend(rec, desc);
		});
	}).tap((rec) => {
		if(rec.inventoryLinkUris)
			return indexRecordUris(rec.inventoryLinkUris);
	}).then((rec) => {
		return db.indexRecord(rec);
	});
}

function loop() {
	return Promise.resolve(db.getSomePendingRecords(BATCH_SIZE)).tap(records => {
		if(!records.length)
			throw "Done!";
	}).map(rec => {
		return Promise.try(() => {
			console.log(`processPendingRecord ${recordToString(rec)}`);
			if(rec.recordType === "directory")
				return indexDirectoryRecord(rec);
			if(rec.recordType === "link")
				return indexLinkRecord(rec);
			if(rec.recordType === "object")
				return indexObjectRecord(rec);
			if(rec.recordType === "world")
				return indexWorldRecord(rec);
			return db.indexRecord(rec);
		}).then(() => {
			// console.log(`processPendingRecord ${recordToString(rec)} done`);
			return db.deletePendingRecord(rec.ownerId, rec.id);
		});
	}, { concurrency: CONCURRENCY }).then(loop);
}

const roots = require("../data/roots");
indexRecordUris(roots).then(() => {
	return loop();
});
