const mongoose = require('mongoose');

const departmentSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        hod: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        description: {
            type: String,
            default: ''
        },
        adminPassword: {
            type: String, // Storing plain text for admin reference as per requirement
            default: ''
        },
        collegeId: {
            type: String,
            unique: true
        },
        isActive: {
            type: Boolean,
            default: true
        },
        departments: [{
            name: { type: String, required: true },
            head: { type: String, default: 'Department Admin' }, // Kept as String for backward compatibility and to store Name
            headUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // New field for the User reference
            email: { type: String },
            adminPassword: { type: String }, // Storing plain text for admin reference
            isActive: { type: Boolean, default: true },
            createdAt: { type: Date, default: Date.now }
        }]
    },
    {
        timestamps: true,
    }
);

const Department = mongoose.model('Department', departmentSchema);

module.exports = Department;
