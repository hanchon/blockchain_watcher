"use strict";

var express = require('express');
var app = express();

var RPC = require('../rpc.js');

var firstBlockHeight = 1;

let rpc = new RPC("127.0.0.1", "9999", "bitcoin", "local321");

async function GetRaws() {
    try {
        let block = await rpc.GetLastBlockData();
        let res = await rpc.GetRawBlock(block.hash);
        let height = block.height;
        // Print the tip
        console.log(res);
        while (height > firstBlockHeight) {
            block = await rpc.GetBlockData(block.prevhash);
            height = block.height;
            res = await rpc.GetRawBlock(block.hash);
            // Print the prev block
            console.log(res)
        }
    } catch (e) {
        console.log("Error RPC call. " + e );
    }
}

(async () => {
    GetRaws();
})();
