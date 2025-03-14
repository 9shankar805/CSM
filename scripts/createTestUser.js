const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function createTestUser() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/csm', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Create test admin user
        const adminUser = await User.create({
            fullName: 'Admin User',
            email: 'admin@example.com',
            password: 'admin123',
            role: 'admin',
            permissions: [
                'manage_users',
                'manage_applications',
                'manage_events',
                'manage_discussions',
                'view_analytics',
                'approve_applications',
                'view_applications',
                'view_users',
                'view_roles',
                'view_events',
                'view_discussions'
            ]
        });

        // Create test regular user
        const regularUser = await User.create({
            fullName: 'Test User',
            email: 'user@example.com',
            password: 'user123',
            role: 'user',
            permissions: [
                'view_applications',
                'view_events',
                'view_discussions'
            ]
        });

        console.log('Test users created successfully:');
        console.log('Admin:', adminUser.email);
        console.log('User:', regularUser.email);

        process.exit(0);
    } catch (error) {
        console.error('Error creating test users:', error);
        process.exit(1);
    }
}

createTestUser();
