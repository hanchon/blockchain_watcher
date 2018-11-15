var sqlite3 = require('sqlite3').verbose();
module.exports = class DB {
    constructor(name) {
        this.name = name;
        this.db = new sqlite3.Database(name);
    }

    async GetAsync(query, params = []) {
        var this_db = this.db;
        return new Promise(function (resolve, reject) {
            this_db.get(query, params, function (err, row) {
                if (err) {
                    reject(err);
                } else
                    resolve(row);
            });
        });
    };

    // TODO: make close async
    Close() {
        this.db.close();
    }

    // TODO: make this call async
    CreateTable() {
        this.db.run("CREATE TABLE IF NOT EXISTS blocks (hash TEXT PRIMARY KEY, size INTEGER, height INTEGER, txns INTEGER, difficulty TEXT, mediantime TEXT, time TEXT, chainwork TEXT, prevhash TEXT, coinbase_script TEXT, orphan INTEGER, last_update TEXT);");
    }

    InsertBlock(block) {
        let query = "INSERT OR IGNORE INTO blocks VALUES (?,?,?,?,?,?,?,?,?,?,0,CURRENT_TIMESTAMP);";
        let params = [block['hash'], block['size'], block['height'], block['txns'], block['difficulty'], block['mediantime'], block['time'], block['chainwork'], block['prevhash'], block['coinbase_script']];
        return this.GetAsync(query, params);
    }

    SetBlockAsNoOrphan(hash) {
        let query = "UPDATE blocks SET (orphan = 0, last_update=CURRENT_TIMESTAMP) WHERE hash = ?;";
        let params = [hash];
        return this.GetAsync(query, params);
    }

    OrphanBlocksAtSameHeight(hash, height) {
        let query = "UPDATE blocks SET (orphan = 1, last_update=CURRENT_TIMESTAMP) WHERE hash != ? and height = ?;";
        let params = [hash, height];
        return this.GetAsync(query, params);
    }

    OrphanBlocksAbove(height) {
        let query = "UPDATE blocks SET (orphan = 1, last_update=CURRENT_TIMESTAMP) WHERE height > ?;";
        let params = [height];
        return this.GetAsync(query, params);
    }

    DoesBlockExist(hash) {
        var this_db = this.db;
        return new Promise((resolve, reject) => {
            this_db.get("SELECT 1 FROM blocks WHERE (hash =  ? AND orphan = 0);", [hash], (err, row) => {
                if (!err && row) {
                    return resolve(true);
                }
                return resolve(false);
            });
        });
    }

    DisplayData() {
        var this_db = this.db;
        return new Promise((resolve, reject) => {
            this_db.all("SELECT * FROM blocks WHERE (orphan = 0) ORDER BY HEIGHT DESC LIMIT 5 ", [], (err, rows) => {
                if (!err && rows) {
                    return resolve(rows);
                }
                return resolve([]);
            });
        });

    }

}