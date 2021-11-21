class BinaryWriter {
	constructor(endianness, encoding) {
		this.endianness = endianness || "big";
		this.encoding = encoding || "utf8";
		this.buffer = Buffer.alloc(1);
		this.length = 0;
	}

	get _capacity() {
		return this.buffer.length;
	}

	write(buf) {
		let newCapacity = this._capacity;
		while(this.length + buf.length > newCapacity)
			newCapacity *= 2;

		if(newCapacity > this._capacity) {
			let newBuffer = Buffer.alloc(newCapacity);
			this.buffer.copy(newBuffer);
			this.buffer = newBuffer;
		}

		buf.copy(this.buffer, this.length);
		this.length += buf.length;
	}

	toBuffer() {
		return this.buffer.slice(0, this.length);
	}

	writeUInt(value, byteLength=4) {
		let tmp = Buffer.allocUnsafe(byteLength);
		if(this.endianness === "little")
			tmp.writeUIntLE(value, 0, byteLength);
		else
			tmp.writeUIntBE(value, 0, byteLength);
		this.write(tmp);
	}
	writeInt(value, byteLength=4) {
		let tmp = Buffer.allocUnsafe(byteLength);
		if(this.endianness === "little")
			tmp.writeIntLE(value, 0, byteLength);
		else
			tmp.writeIntBE(value, 0, byteLength);
		this.write(tmp);
	}
	writeFloat(value) {
		let tmp = Buffer.allocUnsafe(4);
		if(this.endianness === "little")
			tmp.writeFloatLE(value, 0);
		else
			tmp.writeFloatBE(value, 0);
		this.write(tmp);
	}
	writeDouble(value) {
		let tmp = Buffer.allocUnsafe(8);
		if(this.endianness === "little")
			tmp.writeDoubleLE(value, 0);
		else
			tmp.writeDoubleBE(value, 0);
		this.write(tmp);
	}

	writeUInt7Bit(value) {
		do {
			let tmp = value&0x7f;
			value >>= 7;
			if(value != 0)
				tmp |= 0x80;
			this.writeUInt(tmp, 1);
		} while(value != 0);
	}

	writeInt7Bit(value) {
		throw new Error("Not implemented.");
	}

	writeString(value) {
		let tmp = Buffer.from(value, this.encoding);
		this.writeUInt7Bit(tmp.length);
		this.write(tmp);
	}
};

module.exports = { BinaryWriter };
