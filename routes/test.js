const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Test route to create a sample user
router.post('/create-test-user', async (req, res) => {
    try {
        const testUser = new User({
            name: 'Test User',
            email: 'test@example.com',
            password: 'testpassword123',
            role: 'admin'
        });
        
        await testUser.save();
        res.json({ message: 'Test user created successfully', user: testUser });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
