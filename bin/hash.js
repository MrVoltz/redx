const { isRecordUri, parseRecordUri } = require("../lib/cloudx");
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
process.stdout.write(
`Uri: ${uri}
OwnerId: ${recordStub.ownerId}
Id: ${recordStub.id}
Path: ${recordStub.path}
Name: ${recordStub.name}
Hash: ${getRecordHash(recordStub)}
`);
