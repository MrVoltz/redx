const through2 = require("through2");
const bson = require("bson");
const assert = require("assert");
const lzma = require("lzma-native");
const lz4 = require("lz4");
const zlib = require("zlib");
const { Readable, PassThrough } = require('stream');

const { streamToBuffer, promiseTry } = require("./utils");

function maybeStripHeader(stream) {
	const MAGIC = Buffer.from("FrDT", "utf8");
	const HEADER_LEN = MAGIC.length + 4 + 1; // FrDT[version][compression]

	let chunks = [], len = 0, done = false;
	return stream.pipe(through2(function(chunk, enc, callback) {
		if(done) {
			callback(null, chunk);
			return;
		}

		chunks.push(chunk);
		len += chunk.length;

		if(len >= HEADER_LEN) {
			const oldHeader = Buffer.concat(chunks);
			if(oldHeader.slice(0, MAGIC.length).equals(MAGIC)) {
				// strip FrooxEngine header
				this.push(oldHeader.slice(HEADER_LEN));
			} else {
				// raw stream
				this.push(oldHeader);
			}

			done = true;
		}
		callback();
	}));
}

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
	assert(["bson", "7zbson", "lz4bson", "brson"].includes(ext));
	return promiseTry(() => {
		stream = maybeStripHeader(stream);

		if(ext === "7zbson") {
			const decompressor = lzma.createDecompressor();
			return streamToBuffer(repairLzmaHeader(stream).pipe(decompressor));
		}

		if(ext === "lz4bson") {
			const decompressor = lz4.createDecoderStream();
			return streamToBuffer(stream.pipe(decompressor));
		}

		if(ext === "brson") {
			const decompressor = zlib.createBrotliDecompress();
			return streamToBuffer(stream.pipe(decompressor));
		}

		return streamToBuffer(stream);
	}).then(buf => bson.deserialize(buf));
}

function writePackedObject(obj, ext) {
	assert(["bson", "brson", "lz4bson"].includes(ext));
	const stream = Readable.from(bson.serialize(obj));

	if(ext === "lz4bson") {
		const compressor = lz4.createEncoderStream();
		return stream.pipe(compressor);
	}

	if(ext === "brson") {
		const compressor = zlib.createBrotliCompress();
		return stream.pipe(compressor);
	}

	return stream;
}

module.exports = {
	readPackedObject, writePackedObject
};
