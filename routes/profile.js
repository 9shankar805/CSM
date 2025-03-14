import express from 'express';
import { auth } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Get user profile
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
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
router.put('/', auth, async (req, res) => {
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

        const user = await User.findById(req.user._id);
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
