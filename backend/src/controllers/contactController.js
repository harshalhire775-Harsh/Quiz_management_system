const Contact = require('../models/contactModel');
const { sendMail } = require('../services/emailService');

// @desc    Submit a new contact message
// @route   POST /api/contact
// @access  Public
const submitContact = async (req, res) => {
    try {
        const { name, email, message, subject, priority, recipientEmail, senderRole, year } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ message: 'Please fill in all fields' });
        }

        // Clean recipient email
        const cleanRecipientEmail = recipientEmail ? recipientEmail.trim().toLowerCase() : undefined;

        const contact = await Contact.create({
            user: req.user?._id, // Save the logged-in user ID if available
            name,
            email,
            message,
            subject,
            priority,
            recipientEmail: cleanRecipientEmail, // New: Target Recipient
            senderRole: String(senderRole || req.user?.role || 'Guest'), // Setup role
            year: year || req.user?.year || ''
        });

        // Determine Email Recipient
        // If recipientEmail provided (Teacher -> Student), send to Student.
        // Else send to Admin (process.env.SMTP_USER)
        const targetEmail = cleanRecipientEmail || process.env.SMTP_USER;
        const mailSubject = cleanRecipientEmail ? `New Message from ${name}` : `New Contact Message from ${name}`;

        const emailContent = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                <div style="background-color: #6366f1; padding: 24px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${cleanRecipientEmail ? 'New Message' : 'Contact Inquiry'}</h1>
                </div>
                <div style="padding: 32px;">
                    <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">Hello,</p>
                    <p style="font-size: 16px; color: #4b5563; line-height: 1.5; margin-bottom: 24px;">
                        You have received a new message from <strong>${name}</strong> via the QuizPro platform.
                    </p>
                    <div style="background-color: #f3f4f6; border-left: 4px solid #6366f1; padding: 20px; border-radius: 4px; margin-bottom: 24px;">
                        <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Message Details</p>
                        <p style="margin: 4px 0; font-size: 16px; color: #111827;"><strong>From:</strong> ${name} (${email}) ${year ? `[${year}]` : ''}</p>
                        <p style="margin: 4px 0; font-size: 16px; color: #111827;"><strong>Subject:</strong> ${subject || 'N/A'} (${priority || 'Normal'})</p>
                        <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0; font-size: 16px; color: #374151; white-space: pre-wrap;">${message}</p>
                        </div>
                    </div>
                    <div style="margin-top: 32px; text-align: center;">
                         <a href="mailto:${email}" style="background-color: #6366f1; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reply via Email</a>
                    </div>
                </div>
                <div style="background-color: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0;">
                     <p style="font-size: 12px; color: #9ca3af; margin: 0;">&copy; ${new Date().getFullYear()} QuizPro System. All rights reserved.</p>
                </div>
            </div>
        `;

        await sendMail({
            to: targetEmail,
            subject: mailSubject,
            html: emailContent
        });

        const io = req.app.get('socketio');
        if (io) {
            // Populate user info for real-time update
            const populatedContact = await Contact.findById(contact._id).populate('user', 'name email year');

            if (cleanRecipientEmail) {
                const targetRoom = cleanRecipientEmail;
                console.log(`📤 Emitting real-time message to student room: ${targetRoom}`);
                io.to(targetRoom).emit('new_message', populatedContact);
            } else {
                console.log(`📤 Emitting real-time message to admin_room`);
                io.to('admin_room').emit('new_message', populatedContact);
            }
        } else {
            console.warn('⚠️ Socket.io instance not found on app');
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
        const userEmail = req.user.email ? req.user.email.trim() : '';

        if (req.user.role === 'Student') {
            // Students see messages sent TO them (Inbox)
            // Use strict case-insensitive match on normalized email
            query.recipientEmail = { $regex: new RegExp(`^${userEmail}$`, 'i') };
        } else if (req.user.role === 'Super Admin') {
            // Super Admin ONLY sees general inquiries/support queries (No specific recipient)
            // AND we can filter out messages where sender is a Teacher if we want to isolate 'User Queries'
            query.recipientEmail = { $in: [null, undefined, ''] };
            // Ensure they don't see Teacher->Student messages that accidentally hit this
        } else {
            // Teachers/Admins see messages sent TO Admin/System (Inquiries from Students)
            // But we should probably filter by department if they are not Super Admin
            query.recipientEmail = { $in: [null, undefined, ''] };

            if (req.user.role === 'Sir' || req.user.role === 'Admin (HOD)') {
                // If they are a teacher/HOD, they should probably only see inquiries from their department
                // This requires populate or an aggregation. 
                // For now, let's keep it simple or filter after populate if needed, 
                // but let's try to add department to the query if we can.
            }
        }

        const messages = await Contact.find(query)
            .populate('user', 'name email department year rollNumber')
            .sort({ createdAt: -1 });

        // Extra filter for Teachers to only see students in their department
        if (req.user.role === 'Sir' || req.user.role === 'Admin (HOD)') {
            const filtered = messages.filter(msg => {
                const studentDept = msg.user?.department;
                const teacherDept = req.user.department;
                // Only show if department matches OR it was a guest message (no department)
                return studentDept === teacherDept || !studentDept;
            });
            return res.json(filtered);
        }

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

const markAsRead = async (req, res) => {
    try {
        const message = await Contact.findById(req.params.id);

        if (message) {
            message.isRead = true;
            await message.save();
            res.json(message);
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
    deleteMessage,
    markAsRead
};
