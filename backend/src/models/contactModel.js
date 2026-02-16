const mongoose = require('mongoose');

const contactSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        subject: {
            type: String,
        },
        targetSubject: {
            type: String,
            required: true
        },
        priority: {
            type: String,
            default: 'Normal',
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false // Optional, in case a non-logged in user contacts (future proof)
        },
        recipientEmail: {
            type: String, // If null, assumed to be for Admins
        },
        senderRole: {
            type: String,
        },
        year: {
            type: String,
            default: ''
        },
        isRead: {
            type: Boolean,
            default: false
        },
        collegeId: {
            type: String,
            default: ''
        }
    },
    {
        timestamps: true,
    }
);

const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;
