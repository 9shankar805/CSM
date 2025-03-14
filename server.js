import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Serve static files from the Admin directory
app.use(express.static(join(__dirname, 'Admin')));

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
        process.exit(1);
    }
};

// Import routes
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'Admin', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
    });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 8888;

try {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`✨ CSM Server is running on port ${PORT}`);
        console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
        console.log(`📊 MongoDB Status: Connected`);
        console.log(`🚀 Server URL: ${process.env.NODE_ENV === 'production' ? 'https://csm-app.onrender.com' : `http://localhost:${PORT}`}`);
    });
} catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    process.exit(1);
});
