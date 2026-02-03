const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to database (creates file if not exists)
const dbPath = path.resolve(__dirname, '../../bot.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initSchema();
    }
});

function initSchema() {
    db.serialize(() => {
        // 1. Warnings / Strikes Table
        db.run(`CREATE TABLE IF NOT EXISTS warnings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId TEXT NOT NULL,
            groupId TEXT NOT NULL,
            reason TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // 2. Chat Logs Table
        db.run(`CREATE TABLE IF NOT EXISTS chat_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId TEXT,
            userName TEXT,
            groupId TEXT,
            content TEXT,
            type TEXT DEFAULT 'message', -- 'message', 'log', 'alert'
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // 3. Settings (Banned Words, Welcome Message, etc.)
        // We store lists as JSON strings for simplicity in SQLite
        db.run(`CREATE TABLE IF NOT EXISTS settings (
            groupId TEXT PRIMARY KEY,
            bannedWords TEXT DEFAULT '[]',
            welcomeMessage TEXT,
            spamThreshold INTEGER DEFAULT 5
        )`);

        // 4. Muted Users Table
        db.run(`CREATE TABLE IF NOT EXISTS muted_users (
            userId TEXT NOT NULL,
            groupId TEXT NOT NULL,
            muteEndTime INTEGER, -- Timestamp when mute expires
            muteCount INTEGER DEFAULT 0, -- How many times they've been muted
            PRIMARY KEY (userId, groupId)
        )`);

        // 5. Temporary Bans Table
        db.run(`CREATE TABLE IF NOT EXISTS temp_bans (
            userId TEXT NOT NULL,
            groupId TEXT NOT NULL,
            unbanTime INTEGER, -- Timestamp when they should be added back
            banCount INTEGER DEFAULT 0, -- How many times they've been temp-banned
            PRIMARY KEY (userId, groupId)
        )`);

        console.log("Database schema initialized.");
    });
}

/**
 * Helper: Run a query that doesn't return data (INSERT, UPDATE, DELETE)
 */
function run(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

/**
 * Helper: Get first result (SELECT)
 */
function get(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

/**
 * Helper: Get all results (SELECT)
 */
function all(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

module.exports = {
    db,
    run,
    get,
    all
};
