const { createHash } = require("crypto");

const { getRecordUri } = require("./cloudx");
const { salt, ignoredRecordUris } = require("../data/ignorelist");

function saltedSha256(str) {
	const hash = createHash("sha256");
	hash.update(str + salt, "utf8");
	return hash.digest().toString("hex");
}

function getRecordHash(rec) {
	return saltedSha256(getRecordUri(rec));
}

function isRecordIgnored(rec) {
	return ignoredRecordUris.includes(getRecordHash(rec));
}

module.exports = { getRecordHash, isRecordIgnored };
