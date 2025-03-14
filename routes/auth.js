import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Register route
router.post('/register', async (req, res) => {
    try {
        const { 
            fullName, 
            email, 
            phone, 
            password, 
            role,
            profileImage,
            jobTitle,
            location,
            skills,
            professionalSummary,
            workExperience,
            education,
            certifications
        } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        // Create new user
        const user = new User({
            name: fullName,
            fullName,
            email: email.toLowerCase(),
            phone,
            password,
            role: role || 'user',
            profileImage: profileImage || 'assets/compiled/jpg/1.jpg',
            jobTitle,
            location,
            skills,
            professionalSummary,
            workExperience,
            education,
            certifications,
            isActive: true,
            status: 'online',
            lastLogin: new Date()
        });

        await user.save();

        // Generate JWT token
        const token = generateToken(user._id, user.role);

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                permissions: user.permissions,
                profileImage: user.profileImage,
                jobTitle: user.jobTitle,
                location: user.location,
                phone: user.phone
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Error registering user'
        });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Update user status and last login
        user.status = 'online';
        user.lastLogin = new Date();
        await user.save();

        // Generate JWT token
        const token = generateToken(user._id, user.role);

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                permissions: user.permissions || [],
                profileImage: user.profileImage
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging in'
        });
    }
});

// Logout route
router.post('/logout', auth, async (req, res) => {
    try {
        // Update user status to offline
        await User.findByIdAndUpdate(req.user.id, { status: 'offline' });
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during logout'
        });
    }
});

// Get current user
router.get('/current-user', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json({
            success: true,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                permissions: user.permissions || [],
                profileImage: user.profileImage
            }
        });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

export default router;
