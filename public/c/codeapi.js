const {spawn} = require('child_process')
const basePath = path.join(__dirname,"public/code")
const userId = "1";
const lang = "Python";
const input = "Vikas Singh\n12";
var Readable = require('stream').Readable;
require('process');
var s = new Readable() // for input
s.push(input)
s.push(null)






