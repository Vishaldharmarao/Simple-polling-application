// Load environment variables before anything else
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const pollRoutes = require('./routes/pollRoutes');
const voteRoutes = require('./routes/voteRoutes');
const passwordRoutes = require('./routes/passwordRoutes');

const app = express();

// Validate required environment variables
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`❌ Missing required environment variable: ${envVar}`);
        process.exit(1);
    }
}

// MySQL Connection Pool Configuration - Production Ready
const mysqlConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT) || 3306,
    // Return DATETIME as strings instead of JS Date objects to avoid timezone conversion
    dateStrings: true,
    // SSL configuration for Railway MySQL and other cloud providers
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
    // Connection pool settings
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // Connection timeout (30 seconds)
    connectionTimeout: 30000,
    // Enable keep-alive
    enableKeepAlive: true,
    keepAliveInitialDelayMs: 0
};

// IMPORTANT: MySQL server timezone must be set to +05:30 (IST) in your
// managed DB provider (for example Railway) so that NOW() and DATETIME
// comparisons are evaluated in IST. We rely on the DB server's timezone
// and `dateStrings: true` so JavaScript does NOT perform any timezone
// conversions — let MySQL handle time comparisons (e.g. WHERE start_time <= NOW()).

// Initialize MySQL Connection Pool
async function initializeDatabase() {
    try {
        const pool = mysql.createPool(mysqlConfig);
        
        // Test the connection
        const connection = await pool.getConnection();
        await connection.ping();
        connection.release();

        // Force the MySQL session timezone to IST for this pool.
        // Note: This sets the session timezone for the connection used by
        // this query. If your DB provider creates new connections with a
        // different session timezone, consider configuring the server-side
        // timezone or using a connection 'connection' event to set it for
        // each newly created connection. This follows the requested step:
        try {
            await pool.query("SET time_zone = '+05:30'");
        } catch (e) {
            console.warn('⚠️ Could not set MySQL session time_zone to +05:30:', e.message);
        }

        // Log MySQL server (session) time on startup to confirm IST.
        try {
            const [rows] = await pool.query("SELECT NOW() as now");
            console.log('🕒 MySQL IST Time:', rows[0].now);
        } catch (e) {
            console.warn('⚠️ Could not read MySQL server time on startup:', e.message);
        }
        
        console.log('✅ Connected to MySQL database');
        console.log(`📌 Database: ${process.env.DB_NAME} @ ${process.env.DB_HOST}:${process.env.DB_PORT || 3306}`);
        console.log(`🔒 SSL: ${process.env.NODE_ENV === 'production' ? 'Enabled' : 'Disabled'}`);
        
        return pool;
    } catch (error) {
        console.error('❌ MySQL connection error:', error.message);
        console.error('Stack trace:', error.stack);
        console.error('\n⚠️  Please verify your database credentials:');
        console.error(`   - DB_HOST: ${process.env.DB_HOST}`);
        console.error(`   - DB_NAME: ${process.env.DB_NAME}`);
        console.error(`   - DB_PORT: ${process.env.DB_PORT || 3306}`);
        console.error(`   - NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
        process.exit(1);
    }
}

let dbPool = null;

// Temporary permissive CORS for debugging production issues
// NOTE: This allows all origins and should be removed after debugging
// Place immediately after `const app = express();` and before route mounts
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// NOTE: Removed manual Date -> IST formatting middleware. We now rely on
// `dateStrings: true` in the MySQL pool config so DATETIME columns are
// returned as plain strings and MySQL `NOW()` is used for time comparisons.

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toString()}] ${req.method} ${req.path}`);
    next();
});

// Health Check Endpoint
app.get('/api/health', async (req, res) => {
    try {
        // Use MySQL server time for health responses to avoid JS timezone handling
        let currentTime = null;
        if (dbPool) {
            const [rows] = await dbPool.query("SELECT NOW() as currentTime");
            currentTime = rows[0].currentTime;
        }

        res.json({
            status: 'OK',
            message: 'Polling API is running',
            environment: process.env.NODE_ENV || 'development',
            database: process.env.DB_NAME,
            timestamp: currentTime
        });
    } catch (err) {
        res.json({
            status: 'OK',
            message: 'Polling API is running',
            environment: process.env.NODE_ENV || 'development',
            database: process.env.DB_NAME,
            timestamp: null
        });
    }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/password', passwordRoutes);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ 
        success: false, 
        error: 'Endpoint not found',
        path: req.path,
        method: req.method
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    const timestamp = new Date().toString();
    const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    console.error(`\n❌ [${timestamp}] Request ID: ${requestId}`);
    console.error(`   Error: ${err.message}`);
    if (process.env.NODE_ENV === 'development') {
        console.error(`   Stack: ${err.stack}`);
    }
    
    const statusCode = err.status || err.statusCode || 500;
    
    res.status(statusCode).json({
        success: false,
        error: err.message || 'Internal server error',
        requestId: requestId,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Server startup
const PORT = parseInt(process.env.PORT) || 5000;
const HOST = '0.0.0.0'; // Listen on all interfaces for Render deployment

async function startServer() {
    try {
        // Initialize database connection pool
        dbPool = await initializeDatabase();
        
        // Start server on 0.0.0.0 for Render deployment
        const server = app.listen(PORT, HOST, () => {
            console.log(`\n${'='.repeat(60)}`);
            console.log(`🚀 Server is running`);
            console.log(`${'='.repeat(60)}`);
            console.log(`🔗 Host: ${HOST}:${PORT}`);
            console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🗄️  Database: ${process.env.DB_NAME} @ ${process.env.DB_HOST}`);
            console.log(`🔒 SSL/TLS: ${process.env.NODE_ENV === 'production' ? 'Enabled' : 'Disabled'}`);
            console.log(`✅ Polling API is ready to accept requests`);
            console.log(`\n📝 Health check: GET /api/health`);
            console.log(`${'='.repeat(60)}\n`);
        });
        
        // Handle server errors
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`❌ Port ${PORT} is already in use`);
            } else {
                console.error(`❌ Server error: ${err.message}`);
            }
            process.exit(1);
        });
        
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
}

// Graceful shutdown handler
async function gracefulShutdown() {
    console.log('\n⏹️  Shutdown signal received, closing connections...');
    
    try {
        if (dbPool) {
            await dbPool.end();
            console.log('✅ Database connections closed');
        }
        
        console.log('✅ Server shutdown complete');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during shutdown:', error.message);
        process.exit(1);
    }
}

// Handle termination signals
process.on('SIGINT', gracefulShutdown);  // Ctrl+C
process.on('SIGTERM', gracefulShutdown); // Docker/Render stop signal

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('\n❌ Uncaught Exception:', error.message);
    console.error(error.stack);
    gracefulShutdown();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('\n❌ Unhandled Rejection at:', promise);
    console.error('   Reason:', reason);
});

// Start the server
startServer();
