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
	console.log('start ', offset);
	const start = offset;
	const tagType = buf.readUInt8(bufOff.offset++);
	console.log('type ' + tagType + ' at ' + offset);

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
		if (tagType == 0x09) // This is a LIST not an array, its more complex.
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
	const id = buf.readUInt8(++offset);
	const size = typesByID[id].PAYLOAD_SIZE;
	const length = buf.readInt32BE(offset += 2);
	if (tagType == 0x9) {
		parseList(buf, offset)
	} else {
		size = parsedTag
	}
}

function parseCompound(bufOff, parsedTag) {
	let value = [];
	do {
		var {
			tag,
			bytesRead
		} = parseBuffer(bufOff.buf, bufOff.offset);
		bufOff.offset += bytesRead;
		value.push(tag);
	}
	while (!(tag instanceof tags.TAG_End));
	parsedTag.value = value;
}

function parseArray(bufOff, parsedTag) {
	const start = offset;
	const {
		header,
		payload,
		payloadName
	} = parsedTag;
	const reader = (buf['read' + payloadName]).bind(buf);

	let length = buf.readIntBE(offset, header);
	length *= payload;
	offset += header;
	let end = offset + length;

	let value = [];
	for (; offset < end; offset += payload) {
		value.push(reader(offset));
	}
	return {
		tag: value,
		bytesRead: offset - header
	}
}

function parseName(bufOff) {
	const nameLength = bufOff.buf.readInt16BE(bufOff.offset);
	const name = bufOff.buf.toString('utf8', bufOff.offset += 2, bufOff.offset += nameLength);
	return name;
}

module.exports = {
	parseBuffer
}