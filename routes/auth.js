import express from 'express';
import jwt from 'jsonwebtoken';
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

        // Check if user exists
        const userExists = await User.findOne({ email: email.toLowerCase() });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        // Create user - password will be hashed by the User model's pre-save middleware
        const user = await User.create({
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

        if (user) {
            const token = generateToken(user._id, user.role);
            res.status(201).json({
                success: true,
                token,
                user: {
                    id: user._id,
                    name: user.name,
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
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to register user'
        });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
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

        // Generate token
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
            message: 'Server error during login'
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
