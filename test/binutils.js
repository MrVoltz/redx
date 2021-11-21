const { test } = require("uvu"),
	assert = require("assert"),
	_ = require("underscore"),
	fsPromises = require("fs/promises");

const { BinaryWriter } = require("../lib/binutils");

test("writeUInt(42, 1)", () => {
	let writer = new BinaryWriter("little", "utf8");
	writer.writeUInt(42, 1);
	let res = writer.toBuffer();

	assert.equal(res.length, 1);
	assert.equal(res[0], 42);
});

test("double capacity", () => {
	let writer = new BinaryWriter("little", "utf8");
	writer.writeUInt(42, 1);
	writer.writeUInt(69, 1);

	let res = writer.toBuffer();
	assert.equal(res.length, 2);
	assert.equal(res[0], 42);
	assert.equal(res[1], 69);
});

test.run();
