import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

// Get user profile
router.get('/', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user profile
router.put('/', verifyToken, async (req, res) => {
    try {
        const {
            fullName,
            jobTitle,
            location,
            phone,
            skills,
            professionalSummary,
            workExperience,
            education,
            certifications
        } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update fields if provided
        if (fullName) user.fullName = fullName;
        if (jobTitle) user.jobTitle = jobTitle;
        if (location) user.location = location;
        if (phone) user.phone = phone;
        if (skills) user.skills = skills;
        if (professionalSummary) user.professionalSummary = professionalSummary;
        if (workExperience) user.workExperience = workExperience;
        if (education) user.education = education;
        if (certifications) user.certifications = certifications;

        await user.save();
        res.json(user);
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
