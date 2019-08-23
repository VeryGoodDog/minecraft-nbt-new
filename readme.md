# minecraft-nbt-new

[NBT parser and writer](http://www.minecraftwiki.net/wiki/NBT_format)

Complete rewrite of [maxogden/minecraft-nbt](https://github.com/maxogden/minecraft-nbt). Now supports reading AND writing. :)

The main goal of the package is to allow manipulation of NBT data programmatically with JS.
Thus, you can use the TAGs as a separate part of the package:
```js
const { NBTtags } = require('minecraft-nbt-new');
```

## Reading
To parse NBT require `minecraft-nbt-new`'s `NBTReadWriter`:
```js
const { NBTReadWriter } = require('minecraft-nbt-new');
```
After this you can simply call `parseBuffer()`, `parseGzip()`, or `parseNBT()` with a Buffer, path to compressed NBT, or uncompressed NBT.
All of these will output the NBT tree as instances of various TAG objects.

## Writing
Writing starts by having a TAG object that you want to write. Unlike reading data you can't use a single catch-all method.
You must specify what you want, as it can write to JSON, stringified NBT, NBT bytes, or a gzip file:
- `NTBReadWriter.toJSON()`
- `NTBReadWriter.toSNBT()`
- `NBTReadWriter.toNBT()`
- `NBTReadWriter.toGZip()`

## Specifications for each tag:

- TYPE: TAG_End
TYPEID: x0
Payload: None.
Note: This tag is used to mark the end of a TAG_Compound. **Cannot be named!** If type 0 appears where a Named Tag is expected, the name is assumed to be "".

- TYPE: TAG_Byte
TYPEID: x1
Payload: Int8

- TYPE: TAG_Short
TYPEID: x2
Payload: Int16BE

- TYPE: TAG_Int
TYPEID: x3
Payload: Int32BE

- TYPE: TAG_Long
TYPEID: x4
Payload: Int64BE

- TYPE: TAG_Float
TYPEID: x5
Payload: FloatBE

- TYPE: TAG_Double
TYPEID: x6
Payload: DoubleBE

- TYPE: TAG_Byte_Array
TYPEID: x7
Payload: Int32 length + length x Int8

- TYPE: TAG_String
TYPEID: x8
Payload: Int16 length + length x Int8
Note: UTF-8 string of chars.

- TYPE: TAG_List
TYPEID: x9
Payload: Int8 tagId + Int32 length + length x TAG_<tagId>
Note: All tags share the same type.
         
- TYPE: TAG_Compound
TYPEID: xA
Payload: list of Named Tags TAG_End end
Note: May contain other TAG_Compounds, each is terminated by its own TAG_End

- TYPE: TAG_Int_Array
TYPEID: xB
Payload: Int4 length + length x Int4

- TYPE: TAG_Long_Array
TYPEID: xC
Payload: Int4 length + length x Int8