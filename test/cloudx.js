const { test } = require("uvu"),
	assert = require("assert"),
	_ = require("underscore"),
	fsPromises = require("fs/promises");

const { parseRecordUri, parseAssetUri, fetchRecord, fetchAsset } = require("../lib/cloudx");

test("parseRecordUri", () => {
	let { ownerId, id } = parseRecordUri("neosrec:///G-Neos/R-95a40c49-2b4f-46d2-a073-62cc2a8fcba6");
	assert.equal(ownerId, "G-Neos");
	assert.equal(id, "R-95a40c49-2b4f-46d2-a073-62cc2a8fcba6");
});

test("parseAssetUri", () => {
	let { idWithExt, id, ext } = parseAssetUri("neosdb:///b635e188e2da2df92b8f8164a68dded516893373311fc66d3f381466990558cf.7zbson");
	assert.equal(idWithExt, "b635e188e2da2df92b8f8164a68dded516893373311fc66d3f381466990558cf.7zbson");
	assert.equal(id, "b635e188e2da2df92b8f8164a68dded516893373311fc66d3f381466990558cf");
	assert.equal(ext, "7zbson");
});

test("fetchRecord, includeChildren=false", async () => {
	let rec = await fetchRecord("G-Neos", "R-95a40c49-2b4f-46d2-a073-62cc2a8fcba6", false);
	assert.equal(rec.ownerId, "G-Neos");
	assert.equal(rec.id, "R-95a40c49-2b4f-46d2-a073-62cc2a8fcba6");
	assert.equal(rec.isPublic, true);
});

test("fetchRecord, includeChildren=true", async () => {
	let rec = await fetchRecord("G-Neos", "R-95a40c49-2b4f-46d2-a073-62cc2a8fcba6", true);
	assert.notEqual(rec._children.length, 0);
	assert(_.findWhere(rec._children, { name: "Avatars" }));
});

test("fetchAsset", async () => {
	let buf = await fetchAsset("2ea3f01601b111ab5996d7a3b7d24ef5699525e1d76e9e903eaaae500041487b");
	assert(buf.length > 1000);

	let ref = await fsPromises.readFile(__dirname + "/data/2ea3f01601b111ab5996d7a3b7d24ef5699525e1d76e9e903eaaae500041487b.webp");
	assert(buf.equals(ref));
});

test.run();
