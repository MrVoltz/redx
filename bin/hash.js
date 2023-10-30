const { isRecordUri, parseRecordUri, fetchRecord, getRecordUri } = require("../lib/cloudx");
const { getRecordHash } = require("../lib/ignorelist-utils");

function usage() {
	process.stderr.write(`Usage: hash.js RECORD_URI\n`);
	process.exit(1);
}

let uri = process.argv[2];
if(!uri)
	usage();
uri = String(uri).trim();
if(!isRecordUri(uri)) {
	process.stderr.write(`Invalid recordUri: ${uri}\n`);
	usage();
}

const recordStub = parseRecordUri(uri);

function recordToString(rec) {
	return `[${rec.recordType}] ${getRecordUri(rec)} (${rec.path}\\${rec.name})`;
}

function asyncMain() {
	return fetchRecord(recordStub).then(record => {
		console.error(recordToString(record));

		console.log(JSON.stringify(getRecordHash({ ownerId: record.ownerId, id: record.id })));
		console.log(JSON.stringify(getRecordHash({ ownerId: record.ownerId, path: record.path, name: record.name, })));
	});
}

asyncMain().then(() => {
	process.exit(0);
}).catch(err => {
	console.error(err.stack || err);
	process.exit(1);
});
