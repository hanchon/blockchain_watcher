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
        this.db.run("CREATE TABLE IF NOT EXISTS blocks (hash TEXT PRIMARY KEY, size INTEGER, height INTEGER, txns INTEGER, difficulty TEXT, mediantime TEXT, time TEXT, chainwork TEXT, prevhash TEXT, coinbase_script TEXT);");
    }

    InsertBlock(block) {
        let query = "INSERT OR IGNORE INTO blocks VALUES (?,?,?,?,?,?,?,?,?,?);";
        let params = [block['hash'], block['size'], block['height'], block['txns'], block['difficulty'], block['mediantime'], block['time'], block['chainwork'], block['prevhash'], block['coinbase_script']];
        return this.GetAsync(query, params);
    }

    DoesBlockExist(hash) {
        var this_db = this.db;
        return new Promise((resolve, reject) => {
            this_db.get("SELECT 1 FROM blocks WHERE hash =  ? ", [hash], (err, row) => {
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
            this_db.all("SELECT * FROM blocks ORDER BY HEIGHT DESC LIMIT 20 ", [], (err, rows) => {
                if (!err && rows) {
                    return resolve(rows);
                }
                return resolve([]);
            });
        });

    }

}