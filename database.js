const mysql = require('mysql2/promise');
require('dotenv').config();
const mockDb = require('./mock_db');

let pool;
try {
    pool = mysql.createPool({
        host: process.env.DB_HOST || '127.0.0.1',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'brener_db',
        port: process.env.DB_PORT || 3306,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });
} catch (e) {
    console.warn("MySQL pool creation failed, using JSON database fallback:", e.message);
    pool = mockDb;
}

// Wrap query to catch runtime connection errors (like ECONNREFUSED)
const originalQuery = pool.query;
pool.query = async function(sql, params) {
    try {
        if (pool === mockDb) {
            return await mockDb.query(sql, params);
        }
        return await originalQuery.call(pool, sql, params);
    } catch (err) {
        // If it's a connection error, fall back to mockDb!
        if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND' || err.code === 'ETIMEDOUT' || err.errno === 1045) {
            console.warn(`Database connection failed (${err.code || err.message}). Falling back to JSON database (local_db.json).`);
            pool = mockDb; // switch permanently for this session
            return await mockDb.query(sql, params);
        }
        throw err;
    }
};

const originalGetConnection = pool.getConnection;
pool.getConnection = async function() {
    try {
        if (pool === mockDb) {
            return await mockDb.getConnection();
        }
        return await originalGetConnection.call(pool);
    } catch (err) {
        if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND' || err.code === 'ETIMEDOUT' || err.errno === 1045) {
            console.warn(`Database connection failed (${err.code || err.message}). Falling back to JSON database (local_db.json).`);
            pool = mockDb; // switch permanently
            return await mockDb.getConnection();
        }
        throw err;
    }
};

module.exports = pool;
