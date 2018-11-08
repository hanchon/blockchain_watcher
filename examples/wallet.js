var bitcore = require('bitcore-lib-cash')

var keywords = "example keywords for wallet 1"
var value = Buffer.from(keywords);
var hash = bitcore.crypto.Hash.sha256(value);
var bn = bitcore.crypto.BN.fromBuffer(hash);
var privateKey = new bitcore.PrivateKey(bn, bitcore.Networks.regtest)
var address = privateKey.toAddress(bitcore.Networks.regtest);

console.log("Keywords:" + keywords);
console.log("Address:" + address.toString());