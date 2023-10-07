const assert = require("assert");

const { streamToBuffer, ax } = require("./utils");

const API_ENDPOINT = "https://api.resonite.com";
const ASSETS_ENDPOINT = "https://assets.resonite.com";

function stripAtSign(str) {
	if(str.slice(0, 1) === "@")
		return str.slice(1);
	return str;
}

function parseUri(uri) {
	if(!(uri instanceof URL))
		uri = new URL(stripAtSign(uri));
	return uri;
}

function getRecordIdType(id) {
	return id.slice(0, 1);
}

function isRecordUri(uri) {
	return parseRecordUri(uri) !== null;
}

function parseRecordUri(uri) {
	uri = parseUri(uri);
	if(uri.protocol !== "resrec:")
		return null;
	let m = decodeURIComponent(uri.pathname).match(/^\/([^/]+)\/(.+?)\/?$/);
	if(!m)
		return null;
	const ownerId = m[1];
	if(!ownerId.startsWith("G-") && !ownerId.startsWith("U-"))
		return null;
	if(m[2].startsWith("R-"))
		return { ownerId, id: m[2], };
	const pathWithName = m[2].replace(/\//g, "\\");
	const m2 = pathWithName.match(/^(.+)\\(.+?)$/);
	if(!m2)
		return null;
	return { ownerId, path: m2[1], name: m2[2], };
}

function isAssetUri(uri) {
	uri = parseUri(uri);
	return uri.protocol === "resdb:";
}

function parseAssetUri(uri) {
	uri = parseUri(uri);
	assert(isAssetUri(uri));
	let [,idWithExt] = uri.pathname.split("/");
	let [id, ext] = idWithExt.split(".");
	return { idWithExt, id, ext };
}

function getOwnerEndpoint(ownerId) {
	const ownerType = getRecordIdType(ownerId)
	assert(ownerType === "U" || ownerType === "G");

	let recordUrl = API_ENDPOINT;
	recordUrl += ownerType === "U" ? "/users/" : "/groups/";
	recordUrl += ownerId;
	return recordUrl;
}

function getRecordPathname({ path, name, }) {
	const parts = path.split("\\");
	parts.push(name);
	return parts.map(p => encodeURIComponent(p)).join("/");
}

function getRecordUri(recordStub) {
	assert(recordStub.ownerId, "ownerId must be specified");
	assert(recordStub.id || (recordStub.path && recordStub.name), "either id or both path and name must be specified");

	return `resrec:///${recordStub.ownerId}/${recordStub.id ? recordStub.id : getRecordPathname(recordStub)}`;
}

function getParentDirectoryRecordStub(record) {
	const m = record.path.match(/^(.+)\\(.+?)$/);
	if(!m)
		return null;

	return {
		ownerId: record.ownerId,
		path: m[1],
		name: m[2],
	};
}

function fetchDirectoryChildren(record) {
	assert(record.recordType === "directory");
	let ownerEndpoint = getOwnerEndpoint(record.ownerId);
	return ax(ownerEndpoint + "/records", {
		params: {
			path: record.path + "\\" + record.name
		}
	}).then(res => res.data);
}

function fetchRecord(recordStub, includeChildren=false) {
	assert(!!recordStub.ownerId, "ownerId must be specified");
	assert(recordStub.id || recordStub.path, "id or path must be specified");

	const ownerEndpoint = getOwnerEndpoint(recordStub.ownerId);

	return ax(ownerEndpoint + "/records/" + (recordStub.id ? recordStub.id : "root/" + getRecordPathname(recordStub)))
		.then(res => res.data)
		.tap(record => {
			if(!includeChildren || record.recordType !== "directory")
				return;
			return fetchDirectoryChildren(record).then(children => {
				record._children = children
			});
	});
}

function streamAsset(id) {
	return ax(ASSETS_ENDPOINT + "/" + id, {
		responseType: "stream"
	}).then(res => res.data);
}

function fetchAsset(id) {
	return streamAsset(id).then(streamToBuffer);
}

function isPermanentHttpError(err) {
	if(!err || !err.response)
		return false;
	let status = err.response.status;
	return status === 403 || status === 404;}

module.exports = {
	API_ENDPOINT, ASSETS_ENDPOINT,

	parseUri, stripAtSign, getRecordIdType,

	isRecordUri, isAssetUri,
	parseRecordUri, parseAssetUri,
	fetchRecord, fetchDirectoryChildren,
	getRecordUri, getParentDirectoryRecordStub,

	streamAsset, fetchAsset,

	isPermanentHttpError
};
