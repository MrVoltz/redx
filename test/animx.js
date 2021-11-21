const { test } = require("uvu"),
	assert = require("assert"),
	_ = require("underscore"),
	fsPromises = require("fs/promises");

const { writeAnimX } = require("../lib/animx");

test("writeAnimX", async () => {
	let animj = JSON.parse(await fsPromises.readFile(__dirname + "/data/biBsCT2dQk2d84KUCFRjfA.animj"));

	let res = writeAnimX(animj),
		ref = Buffer.from("05416e696d580100000003000080400474657374", "hex");

	assert(res.slice(0, ref.length).equals(ref));
});

test.run();
