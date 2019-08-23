const zlib = require('zlib');
const fs = require('fs');
const input = fs.readFileSync('./spec/pl.dat');
const output = zlib.gunzipSync(input);
fs.writeFileSync('./spec/pl.nbt', output);
fs.writeFileSync('./spec/pl.hex.nbt', output.toString('hex'));