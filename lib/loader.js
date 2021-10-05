const Promise = require("bluebird"),
	through2 = require("through2"),
	bson = require("bson");

function streamToBuffer(stream) {
	return new Promise((resolve, reject) => {
		let chunks = [];
		stream.on("data", c => chunks.push(c));
		stream.on("error", reject);
		stream.on("end", () => resolve(Buffer.concat(chunks)));
	});
}

function repairLzmaHeader(stream) {
	const NEOS_HEADER_LEN = 5+4+2*8, // flags, dict size, orig size, comp size
		FIXED_HEADER_LEN = 5+4+8; // flags, dict size, orig size

	const chunks = [], len = 0, done = false;
	return stream.pipe(through2((chunk, enc, callback) => {
		if(done) {
			callback(null, chunk);
			return;
		}

		chunks.push(chunk);
		len += chunk.length;

		if(len >= HEADER_LEN) {
			let oldHeader = Buffer.concat(chunks),
				fixedHeader = Buffer.alloc(len-8);

			oldHeader.copy(fixedHeader, 0, 0, FIXED_HEADER_LEN); // flags, dict size, orig size
			oldHeader.copy(fixedHeader, FIXED_HEADER_LEN, NEOS_HEADER_LEN); // copy other data
			this.push(fixedHeader);
		}
		callback();
	}));
}

function readPackedTree(stream, ext) {
	assert(["bson", "7zbson", "lz4bson"].indexOf(ext) !== -1);

	return Promise.try(() => {
		if(ext === "7zbson") {
			let decompressor = lzma.createDecompressor();
			return streamToBuffer(stream.pipe(repairLzmaHeader).pipe(decompressor));
		}

		if(ext === "lz4bson") {
			let decompressor = lz4.createDecoderStream();
			return streamToBuffer(stream.pipe(decompressor));
		}

		return streamToBuffer(stream);
	}).then(buf => bson.deserialize(buf));
}

module.exports = {
	readPackedTree
};
