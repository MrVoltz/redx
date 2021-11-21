const { test } = require("uvu"),
	assert = require("assert");

const { getSimpleType } = require("../lib/utils");

test("simple names unchanged", () => {
	assert.equal(getSimpleType("List"), "List");
});

test("namespace stripped", () => {
	assert.equal(getSimpleType("System.Collections.Generic.List"), "List");
});

test("array type", () => {
	assert.equal(getSimpleType("[System.String, mscorlib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089]"), "String");
});

test("simple generic type", () => {
	assert.equal(getSimpleType("System.Collections.Generic.List`1[[System.String, mscorlib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089]]"), "List<String>");
	assert.equal(getSimpleType("FrooxEngine.AssetProxy`1[[FrooxEngine.Material, FrooxEngine, Version=0.7.15.40305, Culture=neutral, PublicKeyToken=null]]"), "AssetProxy<Material>");
});

test("nested generic type", () => {
	assert.equal(getSimpleType("System.Collections.Generic.List`1[[System.Collections.Generic.List`1[[System.String, mscorlib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089]], mscorlib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089]]"), "List<List<String>>");
});

test.run();
