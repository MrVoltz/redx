const Promise = require("bluebird"),
	axios = require("axios"),
	assert = require("assert");

const { streamToBuffer } = require("./utils");

const CLOUDX_ENDPOINT = "https://api.neos.com/api",
	NEOSDB_ENDPOINT = "http://assets.neos.com/assets";

function ax(url, config) {
	return Promise.resolve(axios(url, config));
}

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
	uri = parseUri(uri);
	if(uri.protocol !== "neosrec:")
		return false;
	let { ownerId, id } = parseRecordUri(uri);
	return (getRecordIdType(ownerId) === "U" || getRecordIdType(ownerId) === "G") && getRecordIdType(id) === "R";
}

function isAssetUri(uri) {
	uri = parseUri(uri);
	return uri.protocol === "neosdb:";
}

function parseRecordUri(uri) {
	uri = parseUri(uri);
	assert.equal(uri.protocol, "neosrec:");
	let [,ownerId, id] = uri.pathname.split("/");
	return { ownerId, id };
}

function parseAssetUri(uri) {
	uri = parseUri(uri);
	assert(isAssetUri(uri));
	let [,idWithExt] = uri.pathname.split("/");
	let [id, ext] = idWithExt.split(".");
	return { idWithExt, id, ext };
}

function getOwnerEndpoint(ownerId) {
	let recordUrl = CLOUDX_ENDPOINT,
		ownerType = getRecordIdType(ownerId);
	assert(ownerType === "U" || ownerType === "G");
	recordUrl += ownerType === "U" ? "/users/" : "/groups/";
	recordUrl += ownerId;
	return recordUrl;
}

function getRecordUri(record) {
	return `neosrec:///${record.ownerId}/${record.id}`;
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

function fetchRecord(ownerId, id, includeChildren=false) {
	let ownerEndpoint = getOwnerEndpoint(ownerId);
	return ax(ownerEndpoint + "/records/" + id)
		.then(res => res.data)
		.tap(record => {
			if(!includeChildren)
				return;
			return fetchDirectoryChildren(record).then(children => {
				record._children = children
			});
	});
}

function streamAsset(id) {
	return ax(NEOSDB_ENDPOINT + "/" + id, {
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
	CLOUDX_ENDPOINT, NEOSDB_ENDPOINT,

	parseUri, stripAtSign, getRecordIdType,

	isRecordUri, isAssetUri,
	parseRecordUri, parseAssetUri,
	fetchRecord, fetchDirectoryChildren,
	getRecordUri,

	streamAsset, fetchAsset,

	isPermanentHttpError
};
