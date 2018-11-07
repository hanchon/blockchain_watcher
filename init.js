"use strict";

var express = require('express');
var app = express();
// var request = require('request');
// var server = require('http').createServer(app);
// var io = require('socket.io')(server);

// var bitcore = require('bitcore-lib-cash');
var DB = require('./db.js');
var RPC = require('./rpc.js');

var config = require ('./config.json');

// Statistics start here
const startHeight = config['startHeight'];

var servers = [];
var displayData = [];

// Init the servers
let k = 0;
config['nodes'].forEach(element => {
    let temp = new DB (element.name + '.db')
    temp.CreateTable();
    servers.push({db : temp, rpc : new RPC(element.ip, element.port, element.user, element.pass), id : k});
    displayData[k] = {};
    displayData[k].name = element.name;
    displayData[k].ip = element.ip;
    displayData[k].data = [];
    displayData[k].lastBlock = {};
    k = k + 1;
});

// Close the databases on exit
process.on("SIGINT", function () {
    console.log("Closing databases...")
    servers.forEach(element=>{
        element.db.Close();
    });
    console.log("Databases closed.")
    process.exit();
});

// For each server get the last block and all the previous blocks
async function UpdateDatabases() {
    // TODO: set as mainchain the new blocks, and set as orphan the removed blocks
    servers.forEach(async function(server) {
        try {
            let block = await server.rpc.GetLastBlockData();
            displayData[server.id].lastBlock.hash = block['hash'];
            displayData[server.id].lastBlock.height = block['height'];

            let alreadyExists = await server.db.DoesBlockExist(block['hash']);

            if (!alreadyExists) {
                server.db.InsertBlock(block);
                let currentHeight = block['height'];
                let parentInserted = await server.db.DoesBlockExist(block['prevhash']);

                while (currentHeight > startHeight && !parentInserted ) {
                    let parent = await server.rpc.GetBlockData(block['prevhash']);
                    server.db.InsertBlock(parent);
                    currentHeight = currentHeight - 1;

                    parentInserted = await server.db.DoesBlockExist(parent['prevhash']);
                    block = parent;
                }
            }

            displayData[server.id].data = await server.db.DisplayData();
        } catch (e) {
            console.log("Error updating database: " +server.db.name+". " + e );
        }
    });
}

// Update the database every 20 sec
(async function KeepUpdating() {
    UpdateDatabases().then(function (){
        setTimeout(function(){
            KeepUpdating();
        }, 1000 * 20);
    });
})();


// WebPage:
app.listen(config['webport']);
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'pug')

app.get('/', function (req, res) {
    res.render('index', { title: 'Heya', message: 'Hello there!', block: displayData})
})