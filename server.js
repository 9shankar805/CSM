const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// Load env vars
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Serve static files from the Admin directory
app.use(express.static(path.join(__dirname, 'Admin')));

// MongoDB connection
const connectDB = async () => {
    try {
        console.log('Connecting to MongoDB...');
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/csm', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000
        });

        console.log(`MongoDB Connected Successfully: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error('MongoDB connection error:', {
            message: error.message,
            code: error.code,
            name: error.name
        });
        throw new Error('Database connection failed');
    }
};

// Connect to MongoDB before handling requests
app.use(async (req, res, next) => {
    if (req.path.startsWith('/health')) {
        return next();
    }

    try {
        if (mongoose.connection.readyState !== 1) {
            await connectDB();
        }
        next();
    } catch (error) {
        console.error('Database middleware error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Unable to connect to database'
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Import routes
const authRoutes = require('./routes/auth');

// API routes
app.use('/api/auth', authRoutes);

// Test route
app.get('/api', (req, res) => {
    res.json({ 
        success: true,
        message: 'API is running',
        environment: process.env.NODE_ENV
    });
});

// Serve the main HTML file for all non-API routes (for client-side routing)
app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
        return next();
    }
    // If the request is for a specific HTML file, serve that file
    if (req.path.endsWith('.html')) {
        const htmlFile = path.join(__dirname, 'Admin', req.path);
        return res.sendFile(htmlFile);
    }
    // Otherwise, serve the index.html file
    res.sendFile(path.join(__dirname, 'Admin', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', {
        name: err.name,
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });

    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: Object.values(err.errors).map(e => ({
                field: e.path,
                message: e.message
            }))
        });
    }

    // Handle MongoDB errors
    if (err.name === 'MongoError' || err.name === 'MongoServerError') {
        return res.status(500).json({
            success: false,
            message: 'Database error occurred'
        });
    }

    res.status(err.status || 500).json({
        success: false,
        message: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : err.message
    });
});

// Start server
const PORT = process.env.PORT || 8888;
const server = app.listen(PORT, () => {
    console.log(`✨ CSM Server is running on port ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
    console.log(`📊 MongoDB Status: Connected`);
    console.log(`🚀 Server URL: ${process.env.NODE_ENV === 'production' ? 'https://csm-app.onrender.com' : `http://localhost:${PORT}`}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    // Don't crash in production, just log
    if (process.env.NODE_ENV === 'development') {
        server.close(() => process.exit(1));
    }
});

module.exports = app;
