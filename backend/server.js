const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const pollRoutes = require('./routes/pollRoutes');
const voteRoutes = require('./routes/voteRoutes');
const passwordRoutes = require('./routes/passwordRoutes');

const app = express();

// CORS Configuration
const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:5000', 'http://127.0.0.1:3000'],
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-User-ID', 'X-Requested-With']
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health Check Endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Polling API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/password', passwordRoutes);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.stack : 'Something went wrong'
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
