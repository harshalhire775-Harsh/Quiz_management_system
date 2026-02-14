const mongoose = require('mongoose');

const quizSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        targetYear: {
            type: String, // 'FY', 'SY', 'TY', or 'All'
            required: true,
            default: 'All'
        },
        duration: {
            type: Number,
            required: true,
            default: 30, // in minutes
        },
        scheduledDate: {
            type: Date,
            required: false, // Optional, if they want to schedule it
        },
        numQuestions: {
            type: Number,
            default: 0,
        },
        totalMarks: {
            type: Number,
            required: true,
            default: 100,
        },
        passingMarks: {
            type: Number,
            required: true,
            default: 40,
        },
        negativeMarks: {
            type: Number,
            default: 0, // e.g. 0.25 or 1
        },
        allowedAttempts: {
            type: Number,
            default: 0, // 0 = unlimited, 1 = single attempt
        },
        isPublished: {
            type: Boolean,
            default: false, // Draft by default
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        collegeName: {
            type: String,
            default: ''
        },

        isApproved: {
            type: Boolean,
            default: false,
        },
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;
