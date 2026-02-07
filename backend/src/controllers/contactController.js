const Contact = require('../models/contactModel');
const { sendMail } = require('../services/emailService');

// @desc    Submit a new contact message
// @route   POST /api/contact
// @access  Public
const submitContact = async (req, res) => {
    try {
        const { name, email, message, subject, priority, recipientEmail, senderRole } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ message: 'Please fill in all fields' });
        }

        const contact = await Contact.create({
            user: req.user?._id, // Save the logged-in user ID if available
            name,
            email,
            message,
            subject,
            priority,
            recipientEmail, // New: Target Recipient
            senderRole: String(senderRole || req.user?.role || 'Guest') // Setup role
        });

        // Determine Email Recipient
        // If recipientEmail provided (Teacher -> Student), send to Student.
        // Else send to Admin (process.env.SMTP_USER)
        const targetEmail = recipientEmail || process.env.SMTP_USER;
        const mailSubject = recipientEmail ? `New Message from ${name}` : `New Contact Message from ${name}`;

        const emailContent = `
            <h3>${recipientEmail ? 'New Message' : 'New Contact Inquiry'}</h3>
            <p><strong>From:</strong> ${name} (${email})</p>
            <p><strong>Subject:</strong> ${subject || 'N/A'} (${priority || 'Normal'})</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
        `;

        await sendMail({
            to: targetEmail,
            subject: mailSubject,
            html: emailContent
        });

        const io = req.app.get('socketio');
        if (recipientEmail) {
            // Real-time message to a specific student
            io.to(recipientEmail).emit('new_message', contact);
        } else {
            // Real-time message to admins/teachers
            io.to('admin_room').emit('new_message', contact);
        }

        res.status(201).json({ message: 'Message sent successfully', contact });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all contact messages
// @route   GET /api/contact
// @access  Private
const getMessages = async (req, res) => {
    try {
        let query = {};

        // Filter logic
        if (req.user.role === 'Student') {
            // Students see messages sent TO them (Inbox)
            query.recipientEmail = req.user.email;
        } else {
            // Teachers/Admins see messages sent TO Admin/System (Inquiries from Students)
            // Incoming messages have NO recipientEmail (or it is null/empty)
            query.recipientEmail = { $in: [null, undefined, ''] };
        }

        const messages = await Contact.find(query)
            .populate('user', 'name email department year rollNumber') // Populate student fields
            .sort({ createdAt: -1 });
        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a contact message
// @route   DELETE /api/contact/:id
// @access  Private/SuperAdmin
const deleteMessage = async (req, res) => {
    try {
        const message = await Contact.findById(req.params.id);

        if (message) {
            await message.deleteOne();
            res.json({ message: 'Message removed' });
        } else {
            res.status(404).json({ message: 'Message not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    submitContact,
    getMessages,
    deleteMessage
};
