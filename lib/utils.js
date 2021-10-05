const Promise = require("bluebird");

function streamToBuffer(stream) {
	return new Promise((resolve, reject) => {
		let chunks = [];
		stream.on("data", c => chunks.push(c));
		stream.on("error", reject);
		stream.on("end", () => resolve(Buffer.concat(chunks)));
	});
}

module.exports = {
	streamToBuffer
};
