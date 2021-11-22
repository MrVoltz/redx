require("dotenv").config();

const express = require("express"),
	{ param, query, matchedData, validationResult } = require("express-validator");

const makeInventoryLink = require("../data/inventorylink"),
	{ writePackedObject } = require("../lib/objectloader"),
	{ parseUri } = require("../lib/cloudx"),
	{ searchRecords } = require("../lib/db");

const app = express();

app.set("json spaces", 2);

app.get("/search.:format", [
	param("format").isIn(["animx","animj","json"]),
	query("type").toArray(),
	query("q").trim().optional(),
	query("size").isInt({ min: 1, max: 200 }).toInt().optional(),
	query("from").isInt({ min: 0 }).toInt().optional()
], (req, res, next) => {
	let { format, type, q, size, from } = matchedData(req);
	let errors = validationResult(req);
	if(!errors.isEmpty())
		return res.status(400).json({ errors: errors.array() });

	if(size === undefined)
		size = 10;
	if(from === undefined)
		from = 0;
	if(q === undefined)
		q = "";

	let fulltextQuery;
	if(q !== "")
		fulltextQuery = {
			dis_max: {
				queries: [
					{ match: { simpleName: { query: q, fuzziness: "AUTO", boost: 2 }}},
					{ match: { ownerPathNameSearchable: { query: q, fuzziness: "AUTO", boost: 2 } }},
					{ match: { tagsSearchable: { query: q, fuzziness: "AUTO", boost: 1 } }}
				],
				tie_breaker: 0.7
			}
		};

	let recordTypes = [], objectTypes = [];
	for(let t of type) {
		if([ "directory", "link", "object", "world" ].indexOf(t) !== -1)
			recordTypes.push(t);
		else
			objectTypes.push(t);
	}

	let typeQueries = [];
	if(recordTypes.length)
		typeQueries.push({ terms: { recordType: recordTypes }});
	if(objectTypes.length)
		typeQueries.push({ terms: { objectType: objectTypes }});

	searchRecords({
		bool: {
			must: fulltextQuery ? [ fulltextQuery ] : [],
			should: typeQueries,
			minimum_should_match: typeQueries.length ? 1 : 0
		}
	}, size, from).then(({ total, hits }) => {
		if(format === "json")
			return res.json({ total, hits });


	}).catch(next);
});

function isRecordUri(uri) {
	uri = parseUri(uri);
	return uri.protocol === "neosrec:";
}

app.get("/inventory-link.bson", [
	query("target").trim().custom(isRecordUri),
	query("targetName").trim().notEmpty()
], (req, res, next) => {
	let { target, targetName } = matchedData(req);
	let errors = validationResult(req);
	if(!errors.isEmpty())
		return res.status(400).json({ errors: errors.array() });

	let stream = writePackedObject(makeInventoryLink(target, targetName), "bson");
	stream.pipe(res);
});

app.use((req, res, next) => {
	res.status(404).json({ message: `Cannot ${req.method} ${req.path}` });
})

app.use((err, req, res, next) => {
	console.error(err);
	res.status(500).json({ message: err.message });
});

const port = process.env.PORT || 8002;
app.listen(port, (err) => {
	if(err) {
		console.log(`app.listen failed: ${err.message || err}`);
		return;
	}
	console.log(`app.listen ${port}`);
});
