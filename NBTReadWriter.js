const fsProm = require('fs').promises;
const {
	tags,
	typesByID
} = require('./tags.js');

function parseBuffer(buf, offset = 0) {
	const bufOff = {
		buf,
		offset
	};
	// Create the tag itself. switch is replaced with dynamic method call.
	const start = offset;
	const tagType = buf.readUInt8(bufOff.offset++);
	// console.log('type ' + tagType + ' at ' + offset);

	let parsedTag = new typesByID[tagType]();
	if (tagType == 0x00) return {
		tag: parsedTag,
		bytesRead: 1
	}; // If its an End tag

	// Get and set the name
	parsedTag.setName(parseName(bufOff));

	// If the type is less than 0x6 it is not a variable type
	if (tagType <= 0x06) {
		parsedTag.value = buf['read' + parsedTag.payloadName](bufOff.offset); // Epic...
		bufOff.offset += parsedTag.payload;
	} else {
		if (tagType == 0x09) // This is a LIST not an array, its more complicated
			parseList(bufOff, parsedTag);
		else if (tagType == 0x0a) // It is a compound
			parseCompound(bufOff, parsedTag);
		else // Just arrays are left
			parseArray(bufOff, parsedTag);
	}

	return {
		tag: parsedTag,
		bytesRead: bufOff.offset - start
	};
}

function parseList(bufOff, parsedTag) {
	// console.log('parsing list');
	const {
		buf
	} = bufOff;
	const id = buf.readUInt8(bufOff.offset++);
	const length = buf.readInt32BE(bufOff.offset);
	bufOff.offset += 4;
	// console.log('lengths', length, buf.readUInt8(bufOff.offset - 2), buf.readUInt8(bufOff.offset - 1), buf.readInt16BE(bufOff.offset - 2));
	// this is nuts
	let parser;
	if (id <= 0x06) {
		parser = (bufOff, parsedTag) => {
			// console.log('read' + parsedTag.payloadName);
			parsedTag.value = buf['read' + parsedTag.payloadName](bufOff.offset += parsedTag.payload);
			// bufOff.offset += parsedTag.payload;
		}
	} else {
		if (id == 0x09)
			parser = parseList;
		else if (id == 0x0a)
			parser = parseCompound;
		else
			parser = parseArray;
	}

	// console.log('list length', length);
	parsedTag.value = [];
	for (var i = 0; i < length; i++) {
		const newChild = new typesByID[id]();
		parsedTag.value.push(newChild);
		parser(bufOff, newChild);
	}
}

function parseCompound(bufOff, parsedTag) {
	// console.log('parsing compound');
	const value = [];
	do {
		var {
			tag,
			bytesRead
		} = parseBuffer(bufOff.buf, bufOff.offset);
		bufOff.offset += bytesRead;
		value.push(tag);
	}
	while (!(tag instanceof tags.TAG_End));
	// console.log('parsed compound');
	parsedTag.value = value;
}

function parseArray(bufOff, parsedTag) {
	// console.log('parsing array');
	const {
		payloadName,
		header,
		payload
	} = parsedTag;
	const {
		buf
	} = bufOff;
	// const start = bufOff.offset;
	const reader = (buf['read' + payloadName]).bind(buf);
	// console.log('header', header, 'offset', bufOff.offset);
	const length = buf.readIntBE(bufOff.offset, header) * payload;
	const end = bufOff.offset + length + header;
	bufOff.offset += header;
	// console.log('length, bufOff.offset, end', length, bufOff.offset, end);

	const value = [];
	for (; bufOff.offset < end; bufOff.offset += payload) {
		// console.log('array offset', bufOff.offset);
		value.push(reader(bufOff.offset));
	}
	// console.log('val', value);
	parsedTag.value = value;
}

function parseName(bufOff) {
	const nameLength = bufOff.buf.readInt16BE(bufOff.offset);
	const name = bufOff.buf.toString('utf8', bufOff.offset += 2, bufOff.offset += nameLength);
	return name;
}

module.exports = {
	parseBuffer
}