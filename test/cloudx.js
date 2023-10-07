const { test } = require("uvu"),
	assert = require("assert"),
	_ = require("underscore"),
	fsPromises = require("fs/promises");

const { parseRecordUri, parseAssetUri, fetchRecord, fetchAsset } = require("../lib/cloudx");

test("parseRecordUri, id", () => {
	const { ownerId, id } = parseRecordUri("resrec:///G-Resonite/R-95a40c49-2b4f-46d2-a073-62cc2a8fcba6");
	assert.equal(ownerId, "G-Resonite");
	assert.equal(id, "R-95a40c49-2b4f-46d2-a073-62cc2a8fcba6");
});

test("parseRecordUri, path & name", () => {
	const { ownerId, path, name } = parseRecordUri("resrec:///G-Resonite/Inventory/Resonite Essentials");
	assert.equal(ownerId, "G-Resonite");
	assert.equal(path, "Inventory");
	assert.equal(name, "Resonite Essentials");
});

test("parseRecordUri, encoded path & name", () => {
	const { ownerId, path, name } = parseRecordUri("resrec:///G-Resonite/Inventory/Resonite%20Essentials");
	assert.equal(ownerId, "G-Resonite");
	assert.equal(path, "Inventory");
	assert.equal(name, "Resonite Essentials");
});

test("parseAssetUri", () => {
	const { idWithExt, id, ext } = parseAssetUri("resdb:///b635e188e2da2df92b8f8164a68dded516893373311fc66d3f381466990558cf.7zbson");
	assert.equal(idWithExt, "b635e188e2da2df92b8f8164a68dded516893373311fc66d3f381466990558cf.7zbson");
	assert.equal(id, "b635e188e2da2df92b8f8164a68dded516893373311fc66d3f381466990558cf");
	assert.equal(ext, "7zbson");
});

test("fetchRecord, includeChildren=false", async () => {
	const rec = await fetchRecord({ ownerId: "G-Resonite", id: "R-20943fd1-ccee-4da9-8281-b2bc06a904c5" }, false);
	assert.equal(rec.ownerId, "G-Resonite");
	assert.equal(rec.id, "R-20943fd1-ccee-4da9-8281-b2bc06a904c5");
	assert.equal(rec.isPublic, true);
});

test("fetchRecord by path", async () => {
	const recordStub = parseRecordUri("resrec:///G-Resonite/Inventory/Resonite Essentials");
	const rec = await fetchRecord(recordStub, false);
	assert.equal(rec.ownerId, "G-Resonite");
	assert.equal(rec.id, "R-20943fd1-ccee-4da9-8281-b2bc06a904c5");
	assert.equal(rec.isPublic, true);
});

test("fetchRecord, includeChildren=true", async () => {
	const rec = await fetchRecord({ ownerId: "G-Resonite", id: "R-20943fd1-ccee-4da9-8281-b2bc06a904c5" }, true);
	assert.notEqual(rec._children.length, 0);
	assert(_.findWhere(rec._children, { name: "Avatars" }));
});

test("fetchAsset", async () => {
	const buf = await fetchAsset("2ea3f01601b111ab5996d7a3b7d24ef5699525e1d76e9e903eaaae500041487b");
	assert(buf.length > 1000);

	const ref = await fsPromises.readFile(__dirname + "/data/2ea3f01601b111ab5996d7a3b7d24ef5699525e1d76e9e903eaaae500041487b.webp");
	assert(buf.equals(ref));
});

test.run();
