var request = require('request');
var bitcore = require('bitcore-lib-cash');

module.exports = class RPC {
    constructor(ip, port, user, pass) {
        this.ip = ip;
        this.port = port;
        this.user = user;
        this.pass = pass;
    }

    GenericRequest(method, params) {
        var options = {
            url: 'http://'+this.user+':'+this.pass+'@'+this.ip+':'+this.port,
            method: "POST",
            timeout: 30000,
            followRedirect: true,
            maxRedirects: 10,
            json: {
                "jsonrpc": "1.0",
                "id": "keoken",
                "method": method,
                "params": params
            },
            headers: {
                'content-type': 'text/plain;'
            }
        };
        return new Promise (function (resolve, reject) {
            request.post (options,function (err, resp, body) {
                if (err) {
                    return reject (new Error ('Request error'));
                } else {
                    if (body["error"] == null) {
                        resolve(body['result']);
                    } else {
                        return reject (new Error ('RPC response error is not null. '));
                    }
                }
            });
        });
    }

    GetBlockchainInfo(){
        return this.GenericRequest("getblockchaininfo", {});
    }

    GetBlock(hash){
        return this.GenericRequest("getblock", [hash]);
    }

    GetTransaction(hash){
        return this.GenericRequest("getrawtransaction", [hash]);
    }

    async GetLastHash() {
        let info = await this.GetBlockchainInfo();
        // console.log(info);
        return info['bestblockhash'];
    }

    async GetBlockData(hash) {
        let ret_value = {};

        let block = await this.GetBlock(hash);
        // console.log(block);

        let tx = await this.GetTransaction(block['tx'][0])

        ret_value['hash'] = block ['hash']
        ret_value['size'] = block ['size']
        ret_value['height'] = block ['height']
        ret_value['txns'] = block['tx'].length
        ret_value['difficulty'] = block['difficulty']
        ret_value['mediantime'] = block['mediantime']
        ret_value['time'] = block['time']
        ret_value['chainwork'] = block['chainwork']
        ret_value['prevhash'] = block['previousblockhash']
        
        var tx_bitcore = bitcore.Transaction(tx).toObject();
        ret_value['coinbase_script'] = tx_bitcore['outputs'][0]['script'];

        return ret_value;
    }

    async GetLastBlockData() {
        let last_hash = await this.GetLastHash();
        let data = await this.GetBlockData(last_hash)
        return data;
    }
    
}