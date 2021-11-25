require("dotenv").config();

const Promise = require("bluebird"),
	fsPromises = require("fs/promises"),
	fs = require("fs"),
	path = require("path"),
	_ = require("underscore");

const cloudx = require("../lib/cloudx"),
	db = require("../lib/db"),
	{ describeRecord, describeObject, describeWorld } = require("../lib/objectdescriber"),
	{ recordToString, readRemotePackedObject, maybeIndexPendingRecord, maybeFetchAndIndexPendingRecordUri, maybeFetchAndIndexPendingRecordUris } = require("../lib/spider-utils");

const CONCURRENCY = 2,
	BATCH_SIZE = 16;

function sleepAsync(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function indexDirectoryRecord(rec) {
	return cloudx.fetchDirectoryChildren(rec).map(childRec => {
		return maybeIndexPendingRecord(childRec);
	}).then(() => {
		return db.indexRecord(rec);
	});
}

function indexLinkRecord(rec) {
	return maybeFetchAndIndexPendingRecordUri(rec.assetUri).then(() => {
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

		return readRemotePackedObject(rec.assetUri).then(obj => {
			if(!obj)
				return rec;
			let desc = describeObject(obj);
			console.log(`indexObjectRecord ${recordToString(rec)} description`, desc);
			return _.extend(rec, desc);
		});
	}).tap((rec) => {
		if(rec.worldUri)
			return maybeFetchAndIndexPendingRecordUri(rec.worldUri);
	}).tap((rec) => {
		if(rec.inventoryLinkUris)
			return maybeFetchAndIndexPendingRecordUris(rec.inventoryLinkUris, 1);
	}).then((rec) => {
		return db.indexRecord(rec);
	});
}

function indexWorldRecord(rec) {
	return Promise.try(() => {
		return readRemotePackedObject(rec.assetUri).then(obj => {
			if(!obj)
				return rec;
			let desc = describeWorld(obj);
			console.log(`indexWorldRecord ${recordToString(rec)} description`, desc);
			return _.extend(rec, desc);
		});
	}).tap((rec) => {
		if(rec.inventoryLinkUris)
			return maybeFetchAndIndexPendingRecordUris(rec.inventoryLinkUris, 1);
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
			return Promise.join(
				db.deletePendingRecord(rec.ownerId, rec.id)
				// sleepAsync(500)
			);
		});
	}, { concurrency: CONCURRENCY }).then(loop);
}

const roots = require("../data/roots");
maybeFetchAndIndexPendingRecordUris(roots, CONCURRENCY).then(() => {
	return loop();
});
