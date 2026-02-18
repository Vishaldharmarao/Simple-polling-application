// Load environment variables before anything else
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const { formatDateTimeToIST } = require('./utils/dateFormatter');

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

// Initialize MySQL Connection Pool
async function initializeDatabase() {
    try {
        const pool = mysql.createPool(mysqlConfig);
        
        // Test the connection
        const connection = await pool.getConnection();
        await connection.ping();
        connection.release();
        
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

// IMPORTANT: Middleware to format datetime values in responses
// MySQL DATETIME fields don't have timezone info, but we store them in IST
// Ensure all responses preserve IST timestamps without timezone indicators
app.use((req, res, next) => {
    const originalJson = res.json.bind(res);
    
    res.json = function(data) {
        // Custom replacer to format Date objects as IST strings
        const replacer = (key, value) => {
            if (value instanceof Date) {
                // Convert JavaScript Date object to IST datetime string
                // This properly handles the timezone offset for DATETIME values
                return formatDateTimeToIST(value);
            }
            return value;
        };
        
        // Deep clone and transform the data using the replacer
        const transformedData = JSON.parse(JSON.stringify(data, replacer));
        
        // Call original res.json with transformed data
        return originalJson(transformedData);
    };
    
    next();
});

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// Health Check Endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Polling API is running',
        environment: process.env.NODE_ENV || 'development',
        database: process.env.DB_NAME,
        timestamp: new Date().toISOString()
    });
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
    const timestamp = new Date().toISOString();
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
