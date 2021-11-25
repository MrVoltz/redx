const Promise = require("bluebird");

const { parseUri, isAssetUri, parseAssetUri, isRecordUri, parseRecordUri, isPermanentHttpError, fetchRecord, getRecordUri } = require("./cloudx"),
	{ streamAssetCached } = require("./cloudx-cache"),
	{ getRecord, indexPendingRecord } = require("./db"),
	{ readPackedObject } = require("./objectloader");

function recordToString(rec) {
	return `[${rec.recordType}] ${getRecordUri(rec)} (${rec.path}\\${rec.name})`;
}

function readRemotePackedObject(uri) {
	uri = parseUri(uri);

	if(!isAssetUri(uri)) {
		console.log(`readRemotePackedObject ${uri} skipping invalid uri`);
		return Promise.resolve(null);
	}

	let { id, ext } = parseAssetUri(uri);
	return streamAssetCached(id, ext).then(stream => {
		return readPackedObject(stream, ext).catch(err => {
			console.log(`readRemotePackedObject ${uri} corrupted object ${err.message || err}`);
			return null;
		});
	}).catch(err => {
		if(isPermanentHttpError(err)) {
			console.log(`readRemotePackedObject ${uri} http error ${err.message || err}`);
			return null;
		}
		console.log(`readRemotePackedObject ${uri} error`);
		throw err;
	});
}

function maybeIndexPendingRecord(rec) {
	return getRecord(rec.ownerId, rec.id, true).then(localRec => {
		if(localRec)
			return false;

		console.log(`indexPendingRecord ${recordToString(rec)}`);
		return indexPendingRecord(rec).then(() => true);
	});
}

function maybeFetchAndIndexPendingRecordUri(uri) {
	uri = parseUri(uri);

	if(!isRecordUri(uri)) {
		console.log(`maybeFetchAndIndexPendingRecord ${uri} skipping invalid uri`);
		return Promise.resolve(false);
	}

	let { ownerId, id } = parseRecordUri(uri);
	return getRecord(ownerId, id, true).then(localRec => {
		if(localRec)
			return;

		return fetchRecord(ownerId, id).then(rec => {
			console.log(`indexPendingRecord ${recordToString(rec)}`);
			return indexPendingRecord(rec);
		}).then(() => true).catch(err => {
			if(isPermanentHttpError(err)) {
				console.log(`maybeFetchAndIndexPendingRecordUri ${uri} http error ${err.message || err}`);
				return false;
			}
			console.log(`maybeFetchAndIndexPendingRecordUri ${uri} error`);
			throw err;
		});
	});
}

function maybeFetchAndIndexPendingRecordUris(uris, concurrency) {
	return Promise.map(uris, maybeFetchAndIndexPendingRecordUri, { concurrency });
}

module.exports = {
	recordToString,	readRemotePackedObject,	maybeIndexPendingRecord,
	maybeFetchAndIndexPendingRecordUri, maybeFetchAndIndexPendingRecordUris
};
