const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        phoneNumber: {
            type: String,
        },
        password: {
            type: String,
            required: true,
        },
        isAdmin: {
            type: Boolean,
            required: true,
            default: false,
        },
        isBlocked: {
            type: Boolean,
            default: false,
        },
        isApproved: {
            type: Boolean,
            default: true,
        },
        role: {
            type: String,
            required: true,
            enum: ['Student', 'Sir', 'Admin (HOD)', 'Super Admin'],
            default: 'Student'
        },
        subject: {
            type: [String], // Array of subjects for Sirs
            default: []
        },
        department: {
            type: String, // E.g., 'Computer Science', 'Civil'
            default: ''
        },
        year: {
            type: String,
            enum: ['FY', 'SY', 'TY', ''],
            default: ''
        },
        semester: {
            type: String,
            default: ''
        },
        profileImage: {
            type: String,
            default: '',
        },
        bio: {
            type: String,
            default: '',
        },
        streak: {
            current: { type: Number, default: 0 },
            lastQuizDate: { type: Date }
        },
        scoresHistory: [{
            quizTitle: String,
            score: Number,
            date: { type: Date, default: Date.now }
        }],
        passwordChangedAt: {
            type: Date,
        }
    },
    {
        timestamps: true,
    }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    this.passwordChangedAt = Date.now() - 1000; // Subtract 1s to ensure token created after is valid
});

const User = mongoose.model('User', userSchema);

module.exports = User;
