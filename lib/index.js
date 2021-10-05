const roots = require("../data/roots");

const cloudx = require("./cloudx");

const { ownerId, id } = cloudx.parseNeosRecUri(roots[0]));
