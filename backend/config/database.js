const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Helper to make it work like mysql2 promises (for compatibility)
const execute = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        try {
            // Replace MySQL ? placeholders - SQLite also uses ? so this should work
            if (sql.trim().toUpperCase().startsWith('SELECT')) {
                const stmt = db.prepare(sql);
                const rows = stmt.all(...params);
                resolve([rows]);
            } else if (sql.trim().toUpperCase().startsWith('INSERT')) {
                const stmt = db.prepare(sql);
                const result = stmt.run(...params);
                resolve([{ insertId: result.lastInsertRowid, affectedRows: result.changes }]);
            } else {
                const stmt = db.prepare(sql);
                const result = stmt.run(...params);
                resolve([{ affectedRows: result.changes }]);
            }
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { execute };
