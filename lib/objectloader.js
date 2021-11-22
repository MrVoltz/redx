const Promise = require("bluebird"),
	through2 = require("through2"),
	bson = require("bson"),
	assert = require("assert"),
	lzma = require("lzma-native"),
	lz4 = require("lz4"),
	{ Readable, PassThrough } = require('stream');

const { streamToBuffer } = require("./utils");

function repairLzmaHeader(stream) {
	const NEOS_HEADER_LEN = 5+2*8, // flags+dict size, orig size, comp size
		CORRECT_HEADER_LEN = 5+8; // flags+dict size, orig size

	let chunks = [], len = 0, done = false;
	return stream.pipe(through2(function(chunk, enc, callback) {
		if(done) {
			callback(null, chunk);
			return;
		}

		chunks.push(chunk);
		len += chunk.length;

		if(len >= NEOS_HEADER_LEN) {
			let oldHeader = Buffer.concat(chunks),
				fixedHeader = Buffer.alloc(len-8);

			oldHeader.copy(fixedHeader, 0, 0, CORRECT_HEADER_LEN); // flags+dict size, orig size
			oldHeader.copy(fixedHeader, CORRECT_HEADER_LEN, NEOS_HEADER_LEN); // copy everything after comp size

			this.push(fixedHeader);
			done = true;
		}
		callback();
	}));
}

function readPackedObject(stream, ext) {
	assert.notEqual(["bson", "7zbson", "lz4bson"].indexOf(ext), -1);
	return Promise.try(() => {
		if(ext === "7zbson") {
			let decompressor = lzma.createDecompressor();
			return streamToBuffer(repairLzmaHeader(stream).pipe(decompressor));
		}

		if(ext === "lz4bson") {
			let decompressor = lz4.createDecoderStream();
			return streamToBuffer(stream.pipe(decompressor));
		}

		return streamToBuffer(stream);
	}).then(buf => bson.deserialize(buf));
}

function writePackedObject(obj, ext) {
	assert.equal(ext, "bson");
	return Readable.from(bson.serialize(obj));
}

module.exports = {
	readPackedObject, writePackedObject
};
