const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Helper to make it work like mysql2 promises (for compatibility)
const query = (sql, params = []) => {
    try {
        if (sql.trim().toUpperCase().startsWith('SELECT')) {
            const stmt = db.prepare(sql);
            const rows = stmt.all(...params);
            return [rows];
        } else if (sql.trim().toUpperCase().startsWith('INSERT')) {
            const stmt = db.prepare(sql);
            const result = stmt.run(...params);
            return [{ insertId: result.lastInsertRowid, affectedRows: result.changes }];
        } else {
            const stmt = db.prepare(sql);
            const result = stmt.run(...params);
            return [{ affectedRows: result.changes }];
        }
    } catch (error) {
        throw error;
    }
};

module.exports = {
    execute: (sql, params) => Promise.resolve(query(sql, params)),
    query: (sql, params) => Promise.resolve(query(sql, params))
};
