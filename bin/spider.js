require("dotenv").config();

const Promise = require("bluebird");
const fsPromises = require("fs/promises");
const fs = require("fs");
const path = require("path");
const _ = require("underscore");

const cloudx = require("../lib/cloudx");
const db = require("../lib/db");
const { describeRecord, describeObject, describeWorld } = require("../lib/objectdescriber");
const { recordToString, readRemotePackedObject, isRecordNewer, maybeIndexRecord, maybeIndexPendingRecord, maybeFetchAndIndexPendingRecordUri, maybeFetchAndIndexPendingRecordUris, setRecordDeleted } = require("../lib/spider-utils");
const { indexBy, backOff } = require("../lib/utils");
const { isRecordIgnored } = require("../lib/ignorelist-utils");
const roots = require("../data/roots");

const CONCURRENCY = 2,
	BATCH_SIZE = 16;

function handleIgnoredDirectoryRecord(rec) {
	return Promise.all([
		db.searchRecords(db.buildChildrenQuery(rec), db.MAX_SIZE).then(res => res.hits),
		db.searchPendingRecords(db.buildChildrenQuery(rec), db.MAX_SIZE).then(res => res.hits),
	]).spread((localChildren, localPendingChildren) => {
		return Promise.all([
			Promise.map(localChildren, child => {
				console.log(`indexDirectoryRecord ${recordToString(rec)} ignored removed child ${recordToString(child)}`);
				return setRecordDeleted(child);
			}),
			Promise.map(localPendingChildren, child => {
				console.log(`indexDirectoryRecord ${recordToString(rec)} ignored removed pending child ${recordToString(child)}`);
				return deletePendingRecord(child);
			})
		]);
	}).then(() => {
		return setRecordDeleted(rec);
	});
}

function handleDeletedDirectoryRecord(rec, localChildren, localPendingChildren) {
	return Promise.all([
		Promise.map(localChildren, child => {
			console.log(`indexDirectoryRecord ${recordToString(rec)} deleted removed child ${recordToString(child)}`);
			return setRecordDeleted(child);
		}),
		Promise.map(localPendingChildren, child => {
			if(child.recordType === "directory") // don't delete pending child directories, in case they were moved somewhere else
				return;
			console.log(`indexDirectoryRecord ${recordToString(rec)} deleted removed pending child ${recordToString(child)}`);
			return deletePendingRecord(child);
		})
	]).then(() => {
		return setRecordDeleted(rec);
	});
}

function indexDirectoryRecord(rec) {
	if(isRecordIgnored(rec)) {
		// delete all indexed children and then itself
		console.log(`indexDirectoryRecord ${recordToString(rec)} ignored`);
		return handleIgnoredDirectoryRecord(rec);
	}

	let isRecordDeleted = false;
	return Promise.all([
		cloudx.fetchDirectoryChildren(rec).catch(err => {
			if(cloudx.isPermanentHttpError(err)) {
				console.log(`indexDirectoryRecord ${recordToString(rec)} http error ${err.message || err}`);
				isRecordDeleted = true;
				return [];
			}
			throw err;
		}),
		db.searchRecords(db.buildChildrenQuery(rec), db.MAX_SIZE).then(res => res.hits),
		db.searchPendingRecords(db.buildChildrenQuery(rec), db.MAX_SIZE).then(res => res.hits),
	]).spread((apiChildren, localChildren, localPendingChildren) => {
		if(isRecordDeleted)
			return handleDeletedDirectoryRecord(localChildren, localPendingChildren);

		let apiChildrenById = indexBy(apiChildren, "id"),
			localChildrenById = indexBy(localChildren, "id"),
			localPendingChildrenById = indexBy(localPendingChildren, "id");

		return Promise.all([
			Promise.map(apiChildren, child => {
				if(localPendingChildrenById.has(child.id))
					return;
				if(localChildrenById.has(child.id) && !isRecordNewer(child, localChildrenById.get(child.id)))
					return;
				if(isRecordIgnored(child))
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
				return deletePendingRecord(child);
			}),
		]).then(() => {
			return maybeIndexRecord(rec);
		});
	});
}

function indexLinkRecord(rec) {
	if(isRecordIgnored(rec))
		return setRecordDeleted(rec);

	return maybeFetchAndIndexPendingRecordUri(rec.assetUri).then(() => {
		return maybeIndexRecord(rec);
	});
}

function indexObjectRecord(rec) {
	if(isRecordIgnored(rec))
		return setRecordDeleted(rec);

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
	if(isRecordIgnored(rec))
		return setRecordDeleted(rec);

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

function indexGenericRecord(rec) {
	if(isRecordIgnored(rec))
		return setRecordDeleted(rec);
	return maybeIndexRecord(rec);
}

function deletePendingRecord(rec) {
	let uri = cloudx.getRecordUri(rec);
	if(deletedPendingRecordsThisLoop.has(uri)) {
		console.log(`deletePendingRecord ${recordToString(rec)} already deleted`);
		return Promise.resolve(false);
	}
	deletedPendingRecordsThisLoop.add(uri);
	return db.deletePendingRecord(rec.ownerId, rec.id).then(() => true);
}

var deletedPendingRecordsThisLoop;
function indexPendingRecords() {
	return Promise.resolve(db.getSomePendingRecords(BATCH_SIZE)).then(records => {
		if(!records.length)
			throw "break";

		deletedPendingRecordsThisLoop = new Set;

		// deduplicate records to prevent elastic race condition
		let recordsByUri = indexBy(records, rec => cloudx.getRecordUri(rec));
		return recordsByUri.values();
	}).map(rec => {
		let uri = cloudx.getRecordUri(rec);
		if(deletedPendingRecordsThisLoop.has(uri)) {
			console.log(`processPendingRecord ${recordToString(rec)} skipped already deleted pending record`);
			return;
		}

		return backOff(() => {
			console.log(`processPendingRecord ${recordToString(rec)}`);
			if(rec.recordType === "directory")
				return indexDirectoryRecord(rec);
			if(rec.recordType === "link")
				return indexLinkRecord(rec);
			if(rec.recordType === "object")
				return indexObjectRecord(rec);
			if(rec.recordType === "world")
				return indexWorldRecord(rec);
			return indexGenericRecord(rec);
		}).then(() => {
			return deletePendingRecord(rec);
		});
	}, { concurrency: CONCURRENCY }).then(indexPendingRecords).catch(err => {
		if(err !== "break")
			throw err;
	});
}

function getAllDirectoryRecords() {
	return db.searchRecords({
		bool: {
			filter: [
				{ term: { recordType: "directory" }},
				{ term: { isDeleted: false }},
			]
		}
	}, Infinity).then(res => res.hits);
}


function deleteIgnoredDirectories() {
	return getAllDirectoryRecords().then(records => {
		return Promise.map(records, rec => {
			if(isRecordIgnored(rec)) {
				console.log(`deleteIgnoredDirectories ${recordToString(rec)}`);
				return handleIgnoredDirectoryRecord(rec);
			}
		}, { concurrency: CONCURRENCY });
	});
}

function rescan() {
	return Promise.join(
		getAllDirectoryRecords(),
		db.searchPendingRecords({
			term: { recordType: "directory" }
		}, Infinity).then(res => res.hits)
	).spread((records, pendingRecords) => {
		console.log(`rescan ${records.length} records, ${pendingRecords.length} pending records`);
		let pendingRecordsByUri = new Set;
		for(let rec of pendingRecords)
			pendingRecordsByUri.add(cloudx.getRecordUri(rec));

		let count = 0;
		return Promise.map(records, rec => {
			let uri = cloudx.getRecordUri(rec);
			if(pendingRecordsByUri.has(uri))
				return;
			pendingRecordsByUri.add(uri); // prevent adding more dupes
			count++;
			return db.indexPendingRecord(rec);
		}, { concurrency: CONCURRENCY }).then(() => count);
	}).then(count => {
		console.log(`rescan added ${count} pending directory records`);
	});
}

function propagateIsDeleted() {
	return db.searchRecords({
		term: { isDeleted: true }
	}, Infinity).then(({ hits: deletedRecords }) => {
		console.log(`propagateIsDeleted ${deletedRecords.length} deleted records`);
		let deletedRecordsByUri = new Set;
		for(let rec of deletedRecords)
			deletedRecordsByUri.add(cloudx.getRecordUri(rec));

		let count = 0;
		return Promise.map(deletedRecords, rec => {
			if(rec.recordType !== "directory")
				return;

			return Promise.map(db.searchRecords(db.buildChildrenQuery(rec)).then(res => res.hits), child => {
				let uri = cloudx.getRecordUri(child);
				if(deletedRecordsByUri.has(uri))
					return;

				count++;
				console.log(`propagateIsDeleted ${recordToString(child)} should also be deleted`);
				return setRecordDeleted(child);
			});
		}, { concurrency: CONCURRENCY }).then(() => count);
	}).then((count) => {
		if(count)
			return propagateIsDeleted();
	});
}

const action = process.argv[2];
function asyncMain() {
	if(action === "deleteIgnoredDirectories")
		return deleteIgnoredDirectories();

	return maybeFetchAndIndexPendingRecordUris(roots, CONCURRENCY).then(() => {
		if(process.argv[2] === "rescan")
			return rescan();
	}).then(indexPendingRecords); //.then(propagateIsDeleted);
}

asyncMain().then(() => {
	console.log("done");
	process.exit(0);
}).catch(err => {
	console.error(err.stack || err);
	process.exit(1);
});
