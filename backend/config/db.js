const mysql = require('mysql2/promise');
require('dotenv').config();

// Verify required DB environment variables
const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;

if (DB_HOST === undefined || DB_USER === undefined || DB_PASSWORD === undefined || DB_NAME === undefined) {
  throw new Error('Database environment variables (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME) are required in .env');
}

const pool = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;
