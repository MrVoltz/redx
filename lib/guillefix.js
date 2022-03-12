const { ax } = require("./utils");

function searchRecordsGuillefix(params, size=Infinity, from=0) {
	return ax(process.env.GUILLEFIX_ENDPOINT, {
		params,
		timeout: 1000
	}).then(({ data }) => {
		let hits = [];
		for(let s of data.trim().split("|,")) {
			let parts = s.split("|");
			if(parts.length !== 5)
				continue;
			let rec = {
				recordType: "object",
				thumbnailUri: parts[0],
				assetUri: parts[1],
				name: parts[2],
				ownerName: parts[3],
				path: parts[4],
			};

			hits.push(rec);
		}

		let total = hits.length;
		hits = hits.slice(from, size);

		return { total, hits };
	});
}

module.exports = { searchRecordsGuillefix };
