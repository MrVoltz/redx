const assert = require("assert");
const axios = require("axios");
const _ = require("underscore");

function ax(url, config) {
	return Promise.resolve(axios(url, config));
}

function streamToBuffer(stream) {
	return new Promise((resolve, reject) => {
		const chunks = [];
		stream.on("data", c => chunks.push(c));
		stream.on("error", reject);
		stream.on("end", () => resolve(Buffer.concat(chunks)));
	});
}

function getSimpleType(str) {
	str = str.replace(/ /g, "");

	function stripNamespace(s) {
		s = s.split(".");
		return s[s.length-1];
	}

	function lookAhead(s) {
		return str.slice(0, s.length) === s;
	}
	function compare(s) {
		assert.equal(str.slice(0, s.length), s);
		str = str.slice(s.length);
	}

	function readType() {
		if(lookAhead("["))
			return readTypeArray();

		let namespacedName = str.match(/^([^`, \]]+)/)[1];
		compare(namespacedName);

		let res = stripNamespace(namespacedName);
		if(lookAhead("`"))
			res += "<" + readGenericArgs().join(", ") + ">";
		return res;
	}

	function readTypeArray() {
		compare("[");
		let res = readType();
		let junk = str.match(/^([^\]]+)/)[1];
		compare(junk);
		compare("]");
		return res;
	}

	function readGenericArgs() {
		compare("`");
		let numGenericArgs = str.match(/^([0-9]+)/)[1];
		compare(numGenericArgs);
		compare("[");
		let res = [];
		for(let i = parseInt(numGenericArgs, 10); i-->0; ) {
			res.push(readType());
			if(i > 0)
				compare(",");
		}
		compare("]");
		return res;
	}

	return readType();
}

function startsWith(str, prefix) {
	return str.slice(0, prefix.length) === prefix;
}

function indexBy(list, iteratee, context) {
	iteratee = _.iteratee(iteratee, context);
	let res = new Map;
	_.each(list, v => {
		res.set(iteratee(v), v);
	});
	return res;
}

function sleepAsync(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function backOff(fn, attempts=5, delay=500, factor=2) {
	let i = 0;
	function attempt() {
		return Promise.resolve().then(fn).catch(err => {
			if(++i >= attempts)
				throw err;
			return sleepAsync(delay).then(() => delay *= factor);
		});
	}
	return attempt();
}

function pLimit(limit) {
	const queue = [];
	let activeWorkers = 0;
	async function worker() {
		if(!queue.length || activeWorkers >= limit)
			return;
		activeWorkers++;
		const {fn, args, resolve, reject} = queue.shift();
		await promiseTry(() => fn(...args)).then(resolve).catch(reject);
		activeWorkers--;
		return worker();
	}

	return fn => (...args) => {
		return new Promise((resolve, reject) => {
			queue.push({ fn, args, resolve, reject });
			worker();
		});
	};

}

function promiseMap(coll, iteratee, concurrency=Infinity) {
	if(Number.isFinite(concurrency)) {
		const limit = pLimit(concurrency);
		return Promise.all(coll.map(limit(iteratee)));
	}
	return Promise.all(coll.map(iteratee));
}

function promiseTry(fn) {
	return Promise.resolve().then(fn);
}

module.exports = {
	streamToBuffer, getSimpleType, startsWith, indexBy, ax, sleepAsync, backOff, promiseMap, promiseTry,
};
