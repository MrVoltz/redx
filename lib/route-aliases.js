const _ = require("underscore");
const { pathToRegexp, compile } = require("path-to-regexp");

const routeAliases = {};

function defineAlias(name, path) {
	const params = [];
	pathToRegexp(path, params);

	routeAliases[name] = {
		path, paramNames: _.pluck(params, "name"), compiled: compile(path)
	};
	return path;
}

function buildRelativeUrl(name, values = {}) {
	if(!routeAliases[name])
		throw new Error(`Missing alias: ${name}`);
	const { path, paramNames, compiled } = routeAliases[name];

	let qs = new URLSearchParams;
	let pathParams = {};
	_.each(values, (v, k) => {
		if(paramNames.includes(k))
			pathParams[k] = String(v);
		else if(_.isArray(v)) {
			for(let vv of v)
				qs.append(k, String(vv));
		} else if(_.isBoolean(v))
			qs.append(k, String(+v));
		else if(v !== null && v !== undefined)
			qs.append(k, String(v));
	});
	qs = qs.toString();

	return compiled(pathParams) + (qs ? "?" + qs : "");
}

function install(app) {
	app.routeAlias = function(name, defaultPath) {
		return this.route(defineAlias(name, defaultPath));
	};
	app.use((req, res, next) => {
		req.buildUrl = (name, values, absolute) => {
			const relUrl = buildRelativeUrl(name, values);
			return absolute ? req.fullBaseUrl + relUrl : relUrl;
		};
		res.locals.buildUrl = (...args) => {
			try {
				return req.buildUrl(...args);
			} catch(err) {
				console.error("buildUrl failed: " + err.stack);
				throw err;
			}
		};
		next();
	});
}

module.exports = { defineAlias, buildRelativeUrl, install };
