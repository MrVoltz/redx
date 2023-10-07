const { test } = require("uvu");
const assert = require("assert");

const { fetchRecordCached } = require("../lib/cloudx-cache");
const { parseRecordUri } = require("../lib/cloudx");

async function runTimed(cb) {
	const start = Date.now();
	return [ await cb(), Date.now() - start ];
}

test("fetchRecordCached", async () => {
	const recordStub = parseRecordUri("resrec:///G-Resonite/Inventory/Resonite Essentials");

	const [ rec, coldTime ] = await runTimed(() => fetchRecordCached(recordStub));
	const [ rec2, warmTime ] = await runTimed(() => fetchRecordCached(recordStub));

	assert.equal(rec.id, rec2.id);
	assert(warmTime < 5);
});
