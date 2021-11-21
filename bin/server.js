const express = require("express"),
	{ query, matchedData } = require("express-validator");

const app = express();

app.get("/search", [
	query("format").isIn(["animx","animj","json"]),
	query("type"),
	query("q"),
], (req, res, next) => {

});

const port = process.env.PORT || 8002;
app.listen(port, (err) => {
	if(err) {
		console.log(`app.listen failed: ${err.message || err}`);
		return;
	}
	console.log(`app.listen ${port}`);
});
