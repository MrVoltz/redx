const fs = require("fs"),
	util = require("util");

const { readPackedObject } = require("../lib/objectloader");
const { describeObject, describeWorld } = require("../lib/objectdescriber");

const stream = fs.createReadStream(process.argv[2]);
const format = process.argv[3] || "7zbson";

readPackedObject(stream, format).then(obj => {
	if(obj.Slots)
		console.log(describeWorld(obj));
	else if(obj.Object)
		console.log(describeObject(obj));

	console.log(util.inspect(obj, false, Infinity, true));
});
