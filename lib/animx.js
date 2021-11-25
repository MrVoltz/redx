const assert = require("assert");

const { BinaryWriter } = require("./binutils");

const FRAME_TYPES = [
	"bool", "bool2", "bool3", "bool4",
	"byte", "ushort", "uint", "ulong", "sbyte","short", "int", "long", "int2", "int3", "int4", "uint2", "uint3", "uint4", "long2", "long3", "long4",
	"float", "float2", "float3", "float4", "floatQ", "float2x2", "float3x3", "float4x4",
	"double", "double2", "double3", "double4", "doubleQ", "double2x2", "double3x3", "double4x4",
	"color", "color32", "string"
];

const SUPPORTED_FRAME_TYPES = [ "bool", "string", "int" ]

// https://wiki.neos.com/AnimJ
function writeAnimX({ name, globalDuration, tracks }) {
	let binaryWriter = new BinaryWriter("little", "utf8");
	binaryWriter.writeString("AnimX");
	binaryWriter.writeInt(1, 4);
	binaryWriter.writeUInt7Bit(tracks.length);
	binaryWriter.writeFloat(globalDuration);
	binaryWriter.writeString(name);
	binaryWriter.writeUInt(0, 1);
	for(let track of tracks) {
		assert.equal(track.trackType, "Discrete");
		assert.notEqual(SUPPORTED_FRAME_TYPES.indexOf(track.valueType), -1);

		binaryWriter.writeUInt(1, 1); // discrete
		binaryWriter.writeUInt(FRAME_TYPES.indexOf(track.valueType), 1);

		let data = track.data;
		binaryWriter.writeString(data.node);
		binaryWriter.writeString(data.property);
		binaryWriter.writeUInt7Bit(data.keyframes.length);
		for(let frame of data.keyframes) {
			binaryWriter.writeFloat(frame.time);
			switch(track.valueType) {
				case "bool":
					binaryWriter.writeUInt(!!frame.value, 1);
					break;
				case "int":
					binaryWriter.writeInt(frame.value, 4);
					break;
				case "string":
					if(frame.value === null)
						binaryWriter.writeUInt(0, 1);
					else {
						binaryWriter.writeUInt(1, 1);
						binaryWriter.writeString(frame.value);
					}
					break;
			}
		}
	}
	return binaryWriter.toBuffer();
}

module.exports = { writeAnimX };
