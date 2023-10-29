// To have your directory (including all subdirectories) removed from RedX, there are multiple options:
//
// 1. Create a record named ".noindex" (without quotes, case-sensitive) in the folder and wait up to 1 week for reindex
// 2. Generate record hashes using `node bin/hash.js RECORD_URI` and submit a pull request to add them into this file
// 3. DM the Record URL to MrVoltz on Discord, so he can do the step 2 for you

module.exports = {
	salt: "V02xJoVGI1Klw371yIl3S2c7tWzzrbNN",
	ignoredRecordUris: [
		// U-GrayBoltWolf
		"53b294e8da39e14d4ec077c563fff567bbacba7d164ddcdd00ed0e7ce4bf3f92",
		"acbb091c1350d0431ac9992e6e5fc49b67bda127736e7b70600c0339428b91c6",
		"4486bb441d8c54c8e6a16221677e1e70f0df89eb1ca5de885f72d303e0b3fb21",

		// U-Udyne
		"ead72c03101100ad43be3f0d65b011bfaff39da326f1bd4ce847794a44f83729",
		"9bdda52dbf57d7d88f4dc867fe54db390e415a906a0d01cdce8212b70f29eb66",
	]
};
