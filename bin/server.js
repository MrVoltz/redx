require("dotenv").config();

const express = require("express"),
	_ = require("underscore"),
	Promise = require("bluebird"),
	{ param, query, matchedData, validationResult } = require("express-validator");

const makeInventoryLink = require("../data/inventorylink"),
	{ writePackedObject } = require("../lib/objectloader"),
	{ parseUri, getRecordUri, getRecordIdType } = require("../lib/cloudx"),
	{ searchRecords, getRecord } = require("../lib/db"),
	{ sendHits, buildFulltextQuery, processLocalHits } = require("../lib/server-utils"),
	guillefix = require("../lib/guillefix");

const app = express();

app.set("json spaces", 2);

app.set("port", process.env.PORT || 8002);
app.set("trust proxy", "loopback");

app.use((req, res, next) => {
	let trust = req.app.get('trust proxy fn'),
		host = req.get('X-Forwarded-Host');
	if (!host || !trust(req.connection.remoteAddress, 0))
		host = req.get('Host');
	else if (host.indexOf(',') !== -1)
		host = host.substring(0, host.indexOf(',')).trimRight();

	req.realHost = host;
	req.fullBaseUrl = `${req.protocol}://${req.realHost}${req.baseUrl}`;
	next();
});

app.use(express.static(__dirname + "/../frontend"));

function validateRequest(req) {
	let errors = validationResult(req);
	if(!errors.isEmpty()) {
		req.res.status(400).json({ message: "Invalid request", errors: errors.array() });
		return false;
	}
	return true;
}

app.get("/search.:format", [
	param("format").isIn(["animx","animj","json"]),
	query("type").toArray(),
	query("q").trim().optional(),
	query("image_weight").isFloat({ min: 0, max: 1 }).toFloat().optional(),
	query("size").isInt({ min: 1, max: 200 }).toInt().optional(),
	query("from").isInt({ min: 0 }).toInt().optional(),
	query("v").isInt({ min: -(2**31), max: (2**31)-1 }).toInt().optional()
], (req, res, next) => {
	let { format, type, q, size, from, v, image_weight } = matchedData(req);
	if(!validateRequest(req))
		return;

	if(image_weight === undefined)
		image_weight = 0;
	if(size === undefined)
		size = 10;
	if(from === undefined)
		from = 0;
	if(q === undefined)
		q = "";
	if(v === undefined)
		v = 0;

	let recordTypes = [], objectTypes = [];
	for(let t of type) {
		if([ "directory", "link", "object", "world" ].indexOf(t) !== -1)
			recordTypes.push(String(t));
		else
			objectTypes.push(String(t));
	}

	let typeQueries = [];
	if(recordTypes.length)
		typeQueries.push({ terms: { recordType: recordTypes }});
	if(objectTypes.length)
		typeQueries.push({ terms: { objectType: objectTypes }});

	Promise.try(() => {
		if(image_weight === 0 || q === "")
			return { hits: [], total: 0 };

		return guillefix.searchRecordsCached({
			f: "1e-9", // fuzzy
			t: "0", // text
			i: "1", // image
			q
		}).catch(err => {
			console.log(`guillefix endpoint error: ${err.stack || err}`);
			return { hits: [], total: 0 };
		});
	}).then(({ hits: imageSearchHits }) => {
		let fulltextQuery = buildFulltextQuery(q, imageSearchHits, image_weight);

		return searchRecords({
			bool: {
				must: fulltextQuery || [],
				should: typeQueries,
				minimum_should_match: typeQueries.length ? 1 : 0,
				filter: { term: { isDeleted: false }}
			}
		}, size, from);
	}).then(({ total, hits }) => {
		processLocalHits(hits, req.fullBaseUrl);
		sendHits(res, format, v, total, hits);
	}).catch(next);
});

app.get("/search-guillefix.:format", [
	param("format").isIn(["animx","animj","json"]),
	query("q").trim().optional(),
	query("f").isFloat().toFloat().optional(),
	query("t").isFloat().toFloat().optional(),
	query("i").isFloat().toFloat().optional(),
	query("size").isInt({ min: 1, max: 200 }).toInt().optional(),
	query("from").isInt({ min: 0 }).toInt().optional(),
	query("v").isInt({ min: -(2**31), max: (2**31)-1 }).toInt().optional()
], (req, res, next) => {
	let { format, q, f, t, i, size, from, v } = matchedData(req);
	if(!validateRequest(req))
		return;

	if(size === undefined)
		size = 10;
	if(from === undefined)
		from = 0;
	if(q === undefined)
		q = "";
	if(v === undefined)
		v = 0;

	let fulltextQuery = buildFulltextQuery(q);

	var localHits = searchRecords({
		bool: {
			must: fulltextQuery || [],
			filter: [
				{ term: { recordType: "object" }},
				{ term: { isDeleted: false }}
			]
		}
	}, size, from).then(({ total, hits }) => {
		processLocalHits(hits, req.fullBaseUrl);
		return { total, hits };
	});

	var guillefixHits = guillefix.searchRecordsCached({ q, f, t, i }, size, from).then(({ hits, total }) => {
		for(let rec of hits) {
			rec.spawnUri = rec.assetUri;
			rec.spawnParentUri = null;
		}

		return { total, hits };
	}).catch(err => {
		console.log(`guillefix endpoint error: ${err.stack || err}`);
		return null;
	});

	Promise.join(localHits, guillefixHits).spread((localHits, guillefixHits) => {
		let { total, hits } = guillefixHits || localHits;

		sendHits(res, format, v, total, hits);
	}).catch(next);
});

function isRecordUri(uri) {
	uri = parseUri(uri);
	return uri.protocol === "neosrec:";
}

function isOwnerId(id) {
	let type = getRecordIdType(id);
	return type === "U" || type === "G";
}

function isRecordId(id) {
	return getRecordIdType(id) === "R";
}

app.get("/link.bson", [
	query("target").trim().custom(isRecordUri),
	query("targetName").trim().notEmpty()
], (req, res, next) => {
	let { target, targetName } = matchedData(req);
	if(!validateRequest(req))
		return;

	let stream = writePackedObject(makeInventoryLink(target, targetName), "bson");
	stream.pipe(res);
});

app.get("/parent-link.bson", [
	query("ownerId").trim().custom(isOwnerId),
	query("id").trim().custom(isRecordId),
	query("depth").isInt({ min: 0 }).toInt().optional(),
], (req, res, next) => {
	let { ownerId, id, depth } = matchedData(req);
	if(!validateRequest(req))
		return;
	if(depth === undefined)
		depth = 0;

	getRecord(ownerId, id).then(rec => {
		if(!rec)
			throw "404";

		let parts = rec.path.split("\\");
		if(rec.recordType === "directory")
			parts.push(rec.name);

		depth = Math.max(depth, 1); // skip Inventory

		let should = [];
		for(let i = Math.min(depth, parts.length-1); i < parts.length; i++) {
			should.push({
				bool: {
					must: [
						{ term: { path: String(parts.slice(0, i).join("\\")) }},
						{ term: { "name.name": String(parts[i]) }}
					]
				}
			});
		}

		let query = {
			bool: {
				must: [
					{ term: { recordType: "directory" }},
					{ term: { ownerId: String(rec.ownerId) }}
				],
				should,
				minimum_should_match: 1
			}
		};

		return searchRecords(query, parts.length, 0);
	}).then(({ total, hits }) => {
		if(!hits.length)
			throw "404";
		hits = _.sortBy(hits, h => h.path.length);
		let rec = hits[0];

		let stream = writePackedObject(makeInventoryLink(getRecordUri(rec), rec.name), "bson");
		stream.pipe(res);
	}).catch(err => {
		if(err !== "404")
			throw err;
		res.status(404).json({ message: "Record not found" });
	}).catch(next);
});

app.get("/browse.:format", [
	query("ownerId").trim().custom(isOwnerId),
	query("id").trim().custom(isRecordId),
	query("size").isInt({ min: 1, max: 200 }).toInt().optional(),
	query("from").isInt({ min: 0 }).toInt().optional(),
	query("v").isInt({ min: -(2**31), max: (2**31)-1 }).toInt().optional()
], (req, res, next) => {

});

app.use((req, res, next) => {
	res.status(404).json({ message: `Cannot ${req.method} ${req.path}` });
})

app.use((err, req, res, next) => {
	console.error(err);
	res.status(500).json({ message: err.message });
});

app.listen(app.get("port"), (err) => {
	if(err) {
		console.log(`app.listen failed: ${err.message || err}`);
		return;
	}
	console.log(`app.listen ${app.get("port")}`);
});
