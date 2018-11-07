var sqlite3 = require('sqlite3').verbose();
module.exports = class DB {
    constructor(name) {
        this.name = name;
        this.db = new sqlite3.Database(name);
    }

    Close() {
        this.db.close();
    }

    CreateTable(reset = false){
        if (reset) this.db.run("DROP TABLE IF EXISTS blocks");
        this.db.run("CREATE TABLE IF NOT EXISTS blocks (hash TEXT PRIMARY KEY, size INTEGER, height INTEGER, txns INTEGER, difficulty TEXT, mediantime TEXT, time TEXT, chainwork TEXT, prevhash TEXT, coinbase_script TEXT);");
    }

    InsertBlock (block) {
        var stmt = this.db.prepare("INSERT OR IGNORE INTO blocks VALUES (?,?,?,?,?,?,?,?,?,?);");
        stmt.run(block['hash'], block['size'], block['height'], block['txns'], block['difficulty'], block['mediantime'], block['time'], block['chainwork'], block['prevhash'], block['coinbase_script']);
        stmt.finalize();
    }

    DoesBlockExist(hash) {
        return new Promise((resolve,reject) => {
            this.db.get("SELECT 1 FROM blocks WHERE hash =  ? ", [hash], (err, row) => {
                if (!err && row) {
                    return resolve(true);
                }
                return resolve(false);
            });
        });
    }

    DisplayData() {
        return new Promise((resolve,reject) => {
            this.db.all("SELECT * FROM blocks ORDER BY HEIGHT DESC LIMIT 20 ", [], (err, rows) => {
                if (!err && rows) {
                    return resolve(rows);
                }
                return resolve([]);
            });
        });

    }

}


