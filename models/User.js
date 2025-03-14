import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false
    },
    fullName: {
        type: String,
        required: [true, 'Please provide your full name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    status: {
        type: String,
        enum: ['online', 'offline'],
        default: 'offline'
    },
    jobTitle: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        default: ''
    },
    skills: [{
        type: String
    }],
    professionalSummary: {
        type: String,
        default: ''
    },
    workExperience: [{
        company: String,
        title: String,
        startDate: Date,
        endDate: Date,
        description: [String]
    }],
    education: [{
        school: String,
        degree: String,
        startYear: Number,
        endYear: Number
    }],
    certifications: [{
        name: String,
        issuer: String,
        year: Number,
        status: {
            type: String,
            enum: ['Active', 'Expired'],
            default: 'Active'
        }
    }],
    profileImage: {
        type: String,
        default: 'assets/compiled/jpg/1.jpg'
    },
    lastActive: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date
    },
    isActive: {
        type: Boolean,
        default: true
    },
    permissions: [{
        type: String,
        enum: [
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
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Pre-save middleware to always set name from fullName
userSchema.pre('save', function(next) {
    if (this.fullName) {
        this.name = this.fullName;
    }
    next();
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('Error comparing passwords');
    }
};

const User = mongoose.model('User', userSchema);

export default User;
