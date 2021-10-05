const Promise = require("bluebird");

const CLOUDX_ENDPOINT = "https://api.neos.com/api",
	NEOSDB_ENDPOINT = "http://assets.neos.com/assets";

function getRecordIdType(id) {
	return id.slice(0, 1);
}

function parseNeosRecUri(uri) {
	if(!(uri instanceof URL))
		uri = new URL(uri);
	assert(uri.protocol === "neosrec:");
	let [,ownerId, id] = uri.pathname.split("/");
	return { ownerId, id };
}

function parseNeosDbUri(uri) {
	if(!(uri instanceof URL))
		uri = new URL(uri);
	assert(uri.protocol === "neosdb:");
	let [,idWithExt] = uri.pathname.split("/");
	let [id, ext] = idWithExt.split(".");
	return { idWithExt, id, ext };
}

function getOwnerEndpoint(ownerId) {
	let recordUrl = CLOUDX_ENDPOINT,
		ownerType = getRecordIdType(ownerId);
	assert(ownerType === "U" || ownerType === "G");
	recordUrl += ownerType === "U" ? "/users" : "/groups";
	recordUrl += ownerId;
	return recordUrl;
}

function fetchDirectoryChildren(record) {
	assert(record.recordType === "directory");
	let ownerEndpoint = getOwnerEndpoint(record.ownerId);
	return Promise.resolve(axios.get({
		url: ownerEndpoint + "/records",
		params: {
			path: record.path + "\\" + record.name
		}
	}));
}

function fetchRecord(ownerId, id, includeChildren=false) {
	let ownerEndpoint = getOwnerEndpoint(ownerId);
	return Promise.resolve(axios.get(ownerEndpoint + "/records/" + id)).tap(record => {
		if(!includeChildren)
			return;
		return fetchDirectoryChildren(record).then(children => {
			record._children = children
		});
	});
}

module.exports = {
	CLOUDX_ENDPOINT, NEOSDB_ENDPOINT,

	parseNeosRecUri, parseNeosDbUri,
	fetchRecord, fetchDirectoryChildren
};
