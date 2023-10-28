const assert = require("assert");

const { parseUri, isAssetUri, parseAssetUri, isRecordUri, parseRecordUri, isPermanentHttpError, fetchRecord, getRecordUri } = require("./cloudx");
const { streamAssetCached } = require("./cloudx-cache");
const { getRecord, indexPendingRecord, indexRecord, deleteRecord } = require("./db");
const { readPackedObject } = require("./objectloader");
const { isRecordIgnored } = require("./ignorelist-utils");
const { promiseMap, promiseTry } = require("./utils");

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

const indexedRecordsCache = new Set;
function maybeIndexRecord(record) {
	if(record.isDeleted)
		return Promise.resolve(false);

	let uri = getRecordUri(record);
	if(indexedRecordsCache.has(uri))
		return false;
	indexedRecordsCache.add(uri);

	return getRecord(record).then(localRecord => {
		if(localRecord && !localRecord.isDeleted && !isRecordNewer(record, localRecord))
			return false;

		return promiseTry(() => {
			if(localRecord) {
				console.log(`maybeIndexRecord ${recordToString(record)} updating existing record`);
				return deleteRecord(localRecord.ownerId, localRecord.id);
			}
		}).then(() => {
			return indexRecord(record).then(() => true);
		});
	});
}

function maybeIndexPendingRecord(record) {
	return getRecord(record, true).then(localRecord => {
		if(localRecord)
			return false;

		console.log(`indexPendingRecord ${recordToString(record)}`);
		return indexPendingRecord(record).then(() => true);
	});
}

function maybeFetchAndIndexPendingRecordUri(uri) {
	uri = parseUri(uri);

	if(!isRecordUri(uri)) {
		console.log(`maybeFetchAndIndexPendingRecord ${uri} skipping invalid uri`);
		return Promise.resolve(false);
	}

	const recordStub = parseRecordUri(uri);

	if(isRecordIgnored(recordStub)) {
		console.log(`maybeFetchAndIndexPendingRecordUri ${uri} ignored`);
		return Promise.resolve(false);
	}

	return getRecord(recordStub, true).then(localRecord => {
		if(localRecord)
			return;

		return fetchRecord(recordStub).then(record => {
			// check again now that we have all information about the record
			if(isRecordIgnored(record)) {
				console.log(`maybeFetchAndIndexPendingRecordUri ${uri} ignored`);
				return false;
			}

			console.log(`indexPendingRecord ${recordToString(record)}`);
			return indexPendingRecord(record);
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
	if(!uris.length)
		return Promise.resolve();

	return promiseMap(uris, maybeFetchAndIndexPendingRecordUri, concurrency);
}

function isRecordNewer(first, second) {
	assert(first.lastModificationTime, "lastModificationTime must be specified on first");
	assert(second.lastModificationTime, "lastModificationTime must be specified on second");

	return new Date(first.lastModificationTime) > new Date(second.lastModificationTime);
}

function setRecordDeleted(record) {
	if(record.isDeleted)
		return Promise.resolve();

	return deleteRecord(record).then(() => {
		record.isDeleted = true;
		return indexRecord(record);
	});
}

module.exports = {
	recordToString, readRemotePackedObject, maybeIndexRecord, maybeIndexPendingRecord, isRecordNewer, setRecordDeleted,
	maybeFetchAndIndexPendingRecordUri, maybeFetchAndIndexPendingRecordUris
};
