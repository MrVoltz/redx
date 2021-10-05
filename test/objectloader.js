const { test } = require("uvu"),
	assert = require("assert"),
	fs = require("fs");

const { readPackedObject } = require("../lib/objectloader");

test("readPackedObject, ext=7zbson", async () => {
	let readable = fs.createReadStream(__dirname + "/data/5ce7cdf554ec05a4b5e6de2dba28a492736f0a7e745cc005b6212a7ea10e9633.7zbson");
	let obj = await readPackedObject(readable, "7zbson");

	assert.equal(obj.Object.ID, "79101779-a5cd-486a-8b61-836bfbaa723b");
});

test.run();
