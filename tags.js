const tags = {};
let typesByID = new Array(0xD);
exports.tags = tags;
exports.typesByID = typesByID;
// Base class.
class TAG {
	constructor(tag) {
		this.type = this.constructor.TYPE_NAME; // A short string that has the type.
		this.payload = this.constructor.PAYLOAD_SIZE; // Number of bytes that is stored by this tag.
		this.nameTag = tag.nameTag || null; // The name of this tag. It is optional to start with.
		this.parent = null;
		this.value = tag.value || null; // The value of the tag, optional to support reading files.
	}
	get name() {
		return this.nameTag._value;
	}
	setName(name) {
		if (name === this) throw new Error('Cannot name a TAG_String with itself.');
		if (name instanceof TAG_String) // name can be a JS string or a TAG_String :)
			this.nameTag = name;
		else
			this.nameTag = new TAG_String(name);
		this.nameTag.parent = this;
	}
	calcSize() {
		let size = 1; // Size is always at least one because of the Type ID Byte
		size += this.payload; // Add the payload bytes

		if (this instanceof VariableTag) // Lists and Strings are sized fundamentally differently
			size += this.calcVariableSize(); // and need their own sizing method.

		if (this.nameTag) // Add the size of the name tag too.
			size += this.nameTag.calcVariableSize();

		return size;
	}
}

// TAG Info
/*
Specifications for each tag:

TYPEID: x0
TYPE: TAG_End
Payload: None.
Note:    This tag is used to mark the end of a list.
				 Cannot be named! If type 0 appears where a Named Tag is expected, the name is assumed to be "".

TYPEID: x1
TYPE: TAG_Byte
Payload: Int8

TYPEID: x2
TYPE: TAG_Short
Payload: Int16BE

TYPEID: x3
TYPE: TAG_Int
Payload: Int32BE

TYPEID: x4
TYPE: TAG_Long
Payload: Int64BE

TYPEID: x5
TYPE: TAG_Float
Payload: FloatBE

TYPEID: x6
TYPE: TAG_Double
Payload: DoubleBE

TYPEID: x7
TYPE: TAG_Byte_Array
Payload: TAG_Int length 
         length x TAG_Byte

TYPEID: x8
TYPE: TAG_String
Payload: TAG_Short length 
         length x Int8

TYPEID: x9
TYPE: TAG_List
Payload: TAG_Byte tagId
         TAG_Int length
         length x TAG_<tagId>
Note:    All tags share the same type.
         
TYPEID: xA
TYPE: TAG_Compound
Payload: list of Named Tags
         TAG_End end
Note:    May contain other TAG_Compounds, each is terminated by its own TAG_End

TYPEID: xB
TYPE: TAG_Int_Array
Payload: TAG_Int length
				 length x TAG_Int

TYPEID: xC
TYPE: TAG_Long_Array
Payload: TAG_Int length
				 length x TAG_Long
				 
~~~
*/

// Each tag has the binary value x0-xC.
// We start with the 'End' tag at x0.
// x0
class TAG_End extends TAG {
	constructor() {
		super({});
		delete this.value;
		delete this.nameTag; // These are NOT relevant, thus: YEET!
	}
	setName() {
		throw new Error('Cannot set name of TAG_End.');
	}
}
TAG_End.TYPE_ID = 0x0;
TAG_End.TYPE_NAME = 'End';
TAG_End.PAYLOAD_SIZE = 0;
tags.TAG_End = typesByID[0x0] = TAG_End;

// x1
class TAG_Byte extends TAG {
	constructor(val) {
		super({
			"value": val
		});
	}
}
TAG_Byte.TYPE_ID = 0x1;
TAG_Byte.TYPE_NAME = 'Byte';
TAG_Byte.PAYLOAD_SIZE = 1;
tags.TAG_Byte = typesByID[0x1] = TAG_Byte;

// x2
class TAG_Short extends TAG {
	constructor(val) {
		super({
			"value": val
		});
	}
}
TAG_Short.TYPE_ID = 0x2;
TAG_Short.TYPE_NAME = 'Short';
TAG_Short.PAYLOAD_SIZE = 2;
tags.TAG_Short = typesByID[0x2] = TAG_Short;

// x3
class TAG_Int extends TAG {
	constructor(val) {
		super({
			"value": val
		});
	}
}
TAG_Int.TYPE_ID = 0x3;
TAG_Int.TYPE_NAME = 'Int';
TAG_Int.PAYLOAD_SIZE = 4;
tags.TAG_Int = typesByID[0x3] = TAG_Int;

// x4
class TAG_Long extends TAG {
	constructor(val) {
		super({
			"value": val
		});
	}
}
TAG_Long.TYPE_ID = 0x4;
TAG_Long.TYPE_NAME = 'Long';
TAG_Long.PAYLOAD_SIZE = 8;
tags.TAG_Long = typesByID[0x4] = TAG_Long;

// x5
class TAG_Float extends TAG {
	constructor(val) {
		super({
			"value": val
		});
	}
}
TAG_Float.TYPE_ID = 0x5;
TAG_Float.TYPE_NAME = 'Float';
TAG_Float.PAYLOAD_SIZE = 4;
tags.TAG_Float = typesByID[0x5] = TAG_Float;

// x6
class TAG_Double extends TAG {
	constructor(val) {
		super({
			"value": val
		});
	}
}
TAG_Double.TYPE_ID = 0x6;
TAG_Double.TYPE_NAME = 'Double';
TAG_Double.PAYLOAD_SIZE = 8;
tags.TAG_Double = typesByID[0x6] = TAG_Double;

// End of numeric types...
// This is not an actual tag type and is only used for ease.
class VariableTag extends TAG {
	constructor(tag) {
		super(tag);
		this.header = tag.constructor.HEADER_SIZE; // Lists have a payload size and a header size.
	}
	calcVariableSize() {
		return 1 + this.header + this.payload * this.value.length;
	}
}

// x7
class TAG_Byte_Array extends VariableTag {
	constructor(vals) {
		super({
			"value": vals
		});
	}
}
TAG_Byte_Array.TYPE_ID = 0x7;
TAG_Byte_Array.TYPE_NAME = 'Byte Array';
TAG_Byte_Array.PAYLOAD_SIZE = 1;
TAG_Byte_Array.HEADER_SIZE = 4;
tags.TAG_Byte_Array = types[0x7] = TAG_Byte_Array;

// x8
class TAG_String extends VariableTag {
	constructor(value) {
		super({
			"value": value
		});
	}
}
TAG_String.TYPE_ID = 0x8;
TAG_String.TYPE_NAME = 'String';
TAG_String.PAYLOAD_SIZE = 1;
TAG_String.HEADER_SIZE = 2;
tags.TAG_String = typesByID[0x8] = TAG_String;

// x9
class TAG_List extends VariableTag {
	constructor(vals, type) {
		super({});
	}
}
TAG_List.TYPE_ID = 0x9;
TAG_List.TYPE_NAME = 'List';
TAG_List.PAYLOAD_SIZE = null;
TAG_List.HEADER_SIZE = 2;
tags.TAG_List = typesByID[0x9] = TAG_List;

// xA
class TAG_Compound extends VariableTag {} // TODO: this too
TAG_Compound.TYPE_ID = 0xA;
TAG_Compound.TYPE_NAME = 'Compound';
TAG_Compound.PAYLOAD_SIZE = null;
TAG_Compound.HEADER_SIZE = null;
tags.TAG_Compound = typesByID[0xA] = TAG_Compound;

// xB
class TAG_Int_Array extends VariableTag {
	constructor(vals) {
		super({
			"value": vals
		});
	}
}
TAG_Int_Array.TYPE_ID = 0xB;
TAG_Int_Array.TYPE_NAME = 'Int Array';
TAG_Int_Array.PAYLOAD_SIZE = 4;
TAG_Int_Array.HEADER_SIZE = 4;
tags.TAG_Int_Array = typesByID[0xB] = TAG_Int_Array;

// xC, last one :)
class TAG_Long_Array extends VariableTag {
	constructor(vals) {
		super({
			"type": "Long Array",
			"payloadSize": 8,
			"headerSize": 4,
			"value": vals
		});
	}
}
TAG_Long_Array.TYPE_ID = 0xC;
TAG_Long_Array.TYPE_NAME = 'Long Array';
TAG_Long_Array.PAYLOAD_SIZE = 8;
TAG_Long_Array.HEADER_SIZE = 4;
tags.TAG_Long_Array = typesByID[0xC] = TAG_Long_Array;