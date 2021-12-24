require("dotenv").config();

const Promise = require("bluebird"),
	fsPromises = require("fs/promises"),
	fs = require("fs"),
	path = require("path"),
	_ = require("underscore");

const cloudx = require("../lib/cloudx"),
	db = require("../lib/db"),
	{ describeRecord, describeObject, describeWorld } = require("../lib/objectdescriber"),
	{ recordToString, readRemotePackedObject, isRecordNewer, maybeIndexRecord, maybeIndexPendingRecord, maybeFetchAndIndexPendingRecordUri, maybeFetchAndIndexPendingRecordUris, setRecordDeleted } = require("../lib/spider-utils"),
	{ indexBy } = require("../lib/utils");

const CONCURRENCY = 2,
	BATCH_SIZE = 16;

function sleepAsync(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function indexDirectoryRecord(rec) {
	return Promise.join(
		cloudx.fetchDirectoryChildren(rec),
		db.searchRecords(db.buildChildrenQuery(rec), db.MAX_SIZE).then(res => res.hits),
		db.searchPendingRecords(db.buildChildrenQuery(rec), db.MAX_SIZE).then(res => res.hits),
	).spread((apiChildren, localChildren, localPendingChildren) => {
		let apiChildrenById = indexBy(apiChildren, "id"),
			localChildrenById = indexBy(localChildren, "id"),
			localPendingChildrenById = indexBy(localPendingChildren, "id");

		return Promise.join(
			Promise.map(apiChildren, child => {
				if(localPendingChildrenById.has(child.id))
					return;
				if(localChildrenById.has(child.id) && !isRecordNewer(child, localChildrenById.get(child.id)))
					return;
				console.log(`indexDirectoryRecord ${recordToString(rec)} added/updated child ${recordToString(child)}`);
				return db.indexPendingRecord(child);
			}), // index new records as pending
			Promise.map(localChildren, child => {
				if(apiChildrenById.has(child.id))
					return;
				console.log(`indexDirectoryRecord ${recordToString(rec)} removed child ${recordToString(child)}`);
				return setRecordDeleted(child);
			}),
			Promise.map(localPendingChildren, child => {
				if(apiChildrenById.has(child.id))
					return;
				console.log(`indexDirectoryRecord ${recordToString(rec)} removed pending child ${recordToString(child)}`);
				return db.deletePendingRecord(child.ownerId, child.id);
			}),
		);
	}).then(() => {
		return maybeIndexRecord(rec);
	});
}

function indexLinkRecord(rec) {
	return maybeFetchAndIndexPendingRecordUri(rec.assetUri).then(() => {
		return maybeIndexRecord(rec);
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
		return maybeIndexRecord(rec);
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
		return maybeIndexRecord(rec);
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
			return maybeIndexRecord(rec);
		}).then(() => {
			return Promise.join(
				db.deletePendingRecord(rec.ownerId, rec.id)
				// sleepAsync(500)
			);
		});
	}, { concurrency: CONCURRENCY }).then(loop);
}

function rescan() {
	return Promise.join(
		db.searchRecords({
			term: { recordType: "directory" }
		}, db.MAX_SIZE).then(res => res.hits),
		db.searchPendingRecords({
			term: { recordType: "directory" }
		}, db.MAX_SIZE).then(res => res.hits)
	).spread((records, pendingRecords) => {
		console.log(`rescan ${records.length} records, ${pendingRecords.length} pending records`);
		let pendingRecordsByUri = new Set;
		for(let rec of pendingRecords)
			pendingRecordsByUri.add(cloudx.getRecordUri(rec));

		let count = 0;
		return Promise.map(records, rec => {
			if(pendingRecordsByUri.has(cloudx.getRecordUri(rec)))
				return;
			count++;
			return db.indexPendingRecord(rec);
		}, { concurrency: CONCURRENCY }).then(() => count);
	}).then(count => {
		console.log(`rescan indexed ${count} records`);
	});
}

const roots = require("../data/roots");
maybeFetchAndIndexPendingRecordUris(roots, CONCURRENCY).then(() => {
	if(process.argv[2] === "rescan")
		return rescan();
}).then(() => {
	return loop();
});
