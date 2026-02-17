// Load environment variables
require('dotenv').config();
const mysql = require('mysql2/promise');

// Validate required environment variables
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`❌ Missing required environment variable in db/connection.js: ${envVar}`);
        // Don't exit here, let the application startup handle it
    }
}

// MySQL Connection Pool Configuration - Production Ready
const poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'polling_app',
    port: parseInt(process.env.DB_PORT) || 3306,
    // SSL configuration for Railway MySQL and production cloud databases
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
    // Connection pool settings
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // Connection timeout (30 seconds)
    connectionTimeout: 30000,
    // Enable keep-alive for better connection management
    enableKeepAlive: true,
    keepAliveInitialDelayMs: 0
};

// Create connection pool
const pool = mysql.createPool(poolConfig);

// Test the connection pool on startup
pool.getConnection()
    .then(connection => {
        connection.ping()
            .then(() => {
                console.log('✅ Database pool connected and verified');
                connection.release();
            })
            .catch(err => {
                console.error('❌ Database connection test failed:', err.message);
                connection.release();
            });
    })
    .catch(err => {
        console.error('❌ Failed to create database pool:', err.message);
        console.error('\n⚠️  Please verify your database credentials:');
        console.error(`   - DB_HOST: ${process.env.DB_HOST || 'not set'}`);
        console.error(`   - DB_NAME: ${process.env.DB_NAME || 'not set'}`);
        console.error(`   - DB_PORT: ${process.env.DB_PORT || '3306'}`);
        console.error(`   - NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
    });

module.exports = pool;
