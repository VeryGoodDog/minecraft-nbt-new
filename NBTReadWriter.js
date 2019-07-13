// None of this actually works.

const fsProm = require('fs').promises;
const tags = require('./tags.js');

module.exports = class NBTReadWriter {
	constructor(file) {
		fsProm.open(file, 'w+')
			.then(fh => {
				this.fh = fh;
			});
	}
	read(ops) {

	}
}



function NBTReader(nbtbytes) {
	var i, _i, _ref13;

	this.nbtbytes = nbtbytes;
	this.getString = __bind(this.getString, this);
	this.getInt32 = __bind(this.getInt32, this);
	this.getInt16 = __bind(this.getInt16, this);
	this.getFloat64 = __bind(this.getFloat64, this);
	this.getInt64 = __bind(this.getInt64, this);
	this.getFloat32 = __bind(this.getFloat32, this);
	this.getInt8 = __bind(this.getInt8, this);
	this.getUint8 = __bind(this.getUint8, this);
	this.nbtBuffer = new ArrayBuffer(nbtbytes.length);
	this.byteView = new Uint8Array(this.nbtBuffer);
	for (i = _i = 0, _ref13 = nbtbytes.length - 1; 0 <= _ref13 ? _i <= _ref13 : _i >= _ref13; i = 0 <= _ref13 ? ++_i : --_i) {
		this.byteView[i] = nbtbytes[i];
	}
	this.dataview = new dataview(this.nbtBuffer);
	this.dataview.seek.call(this.dataview, 0);
}
NBTReader.prototype.getUint8 = function () {
	return this.dataview.getUint8.call(this.dataview);
};
NBTReader.prototype.getInt8 = function () {
	return this.dataview.getInt8.call(this.dataview);
};
NBTReader.prototype.getFloat32 = function () {
	return this.dataview.getFloat32.call(this.dataview);
};
NBTReader.prototype.getFloat64 = function () {
	return this.dataview.getFloat64.call(this.dataview);
};
NBTReader.prototype.getInt64 = function () {
	return this.dataview.getInt64.call(this.dataview);
};
NBTReader.prototype.getInt16 = function () {
	return this.dataview.getInt16.call(this.dataview);
};
NBTReader.prototype.getInt32 = function () {
	return this.dataview.getInt32.call(this.dataview);
};
NBTReader.prototype.getString = function (length) {
	return this.dataview.getString.call(this.dataview, length, undefined, 'utf8');
};
NBTReader.prototype.read = function (typespec) {
	var e, name, name2, ret, tag, type, typeStr;

	try {
		type = null;
		if (typespec == null) {
			type = this.getUint8();
			if (type == null) {
				console.log('problem with type in nbt. type is:');
				console.log(type);
			}
		} else {
			type = typespec;
		}
		typeStr = '_' + type.toString();
		name = tags[typeStr];
		switch (name) {
			case 'TAG_End':
				tag = new TAG_End(this);
				break;
			case 'TAG_Byte':
				tag = new TAG_Byte(this);
				break;
			case 'TAG_Short':
				tag = new TAG_Short(this);
				break;
			case 'TAG_Int':
				tag = new TAG_Int(this);
				break;
			case 'TAG_Long':
				tag = new TAG_Long(this);
				break;
			case 'TAG_Float':
				tag = new TAG_Float(this);
				break;
			case 'TAG_Double':
				tag = new TAG_Double(this);
				break;
			case 'TAG_Byte_Array':
				tag = new TAG_Byte_Array(this);
				break;
			case 'TAG_Int_Array':
				tag = new TAG_Int_Array(this);
				break;
			case 'TAG_String':
				tag = new TAG_String(this);
				break;
			case 'TAG_List':
				tag = new TAG_List(this);
				break;
			case 'TAG_Compound':
				tag = new TAG_Compound(this);
				break;
			default:
				tag = new TAG_Unknown(this);
		}
		if (name === 'TAG_End') {
			return '=END=';
		}
		ret = {};
		name2 = '';
		if (typespec == null) {
			if (name !== 'TAG_End') {
				name2 = tag.readName();
				if (name === 'TAG_Compound' && name2 === '') {
					name2 = 'root';
				}
			} else {
				name2 = 'END';
			}
			ret[name2] = tag.read();
		} else {
			ret = tag.read();
		}
		return ret;
	} catch (_error) {
		e = _error;
		console.log('Error in nbt: ' + e.message);
		console.log(e.stack);
		return null;
	}
};