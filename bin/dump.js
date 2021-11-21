const fs = require("fs"),
	util = require("util");

const { readPackedObject } = require("../lib/objectloader"),
	{ describeObject, describeWorld } = require("../lib/objectdescriber");

let stream = fs.createReadStream(process.argv[2]);
readPackedObject(stream, "7zbson").then(obj => {
	if(obj.Slots)
		console.log(describeWorld(obj));
	else if(obj.Object)
		console.log(describeObject(obj));

	console.log(util.inspect(obj, false, Infinity, true));
});
