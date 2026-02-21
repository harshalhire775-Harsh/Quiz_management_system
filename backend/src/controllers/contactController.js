const Contact = require('../models/contactModel');
const { sendMail } = require('../services/emailService');

// @desc    Submit a new contact message
// @route   POST /api/contact
// @access  Public
// @desc    Submit a new contact message
// @route   POST /api/contact
// @access  Public
const User = require('../models/userModel');

// @desc    Submit a new contact message
// @route   POST /api/contact
// @access  Public
const submitContact = async (req, res) => {
    console.log("📥 Received Contact Submission:", req.body);
    try {
        const { name, email, message, subject, priority, recipientEmail, senderRole, year, targetSubject } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ message: 'Please fill in all fields' });
        }

        // Clean recipient email
        const cleanRecipientEmail = recipientEmail ? recipientEmail.trim().toLowerCase() : undefined;
        let collegeId = req.user?.collegeId; // Inherit from sender

        // STRICT ISOLATION CHECK
        // If sender is logged in, use their collegeId. 
        // If missing from token (stale session), fetch from DB once.
        if (req.user) {
            collegeId = req.user.collegeId;
            if (!collegeId) {
                const refreshedUser = await User.findById(req.user._id);
                if (refreshedUser) {
                    collegeId = refreshedUser.collegeId;
                    console.log(`[submitContact] Refreshed CollegeId for user ${refreshedUser.email}: ${collegeId}`);
                }
            }

            // If sending to a specific person (Teacher -> Student or Vice Versa), verify they are in same college
            if (cleanRecipientEmail) {
                const recipient = await User.findOne({ email: cleanRecipientEmail });

                if (!recipient) {
                    console.log("❌ Recipient not found:", cleanRecipientEmail);
                    return res.status(404).json({ message: 'Recipient not found' });
                }

                if (recipient.collegeId !== collegeId && req.user.role !== 'Super Admin') {
                    console.log("❌ Cross-college message attempt blocked.");
                    return res.status(403).json({ message: 'Forbidden: You cannot message users from other colleges.' });
                }
            }
        }

        const contact = await Contact.create({
            user: req.user?._id, // Save the logged-in user ID if available
            name,
            email,
            message,
            subject,
            priority,
            targetSubject: targetSubject || 'General',
            recipientEmail: cleanRecipientEmail, // New: Target Recipient
            senderRole: String(senderRole || req.user?.role || 'Guest'), // Setup role
            year: year || req.user?.year || '',
            collegeId: collegeId // Crucial for Isolation
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
                        <p style="margin: 4px 0; font-size: 16px; color: #111827;"><strong>Target Subject:</strong> ${targetSubject || 'General'}</p>
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
            const populatedContact = await Contact.findById(contact._id).populate('user', 'name email year');

            if (cleanRecipientEmail) {
                const targetRoom = cleanRecipientEmail;
                console.log(`📤 Emitting real-time message to student room: ${targetRoom}`);
                io.to(targetRoom).emit('new_message', populatedContact);
            } else {
                if (collegeId) {
                    console.log(`📤 Emitting to college room: college_${collegeId}`);
                    io.to(`college_${collegeId}`).emit('new_message', populatedContact);
                }
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
        const { collegeId, role, subject } = req.user;

        // SUPER ADMIN: Sees everything (or can filter)
        if (role === 'Super Admin') {
            query.recipientEmail = { $in: [null, undefined, ''] };
        }
        // COLLEGE LEVEL USERS (Student, Sir, Admin)
        else {
            // 1. STRICT ISOLATION: Must belong to user's college
            // Allow empty string if user has empty collegeId (matches legacy/unassigned users)
            if (collegeId === undefined) {
                query.collegeId = "NO_COLLEGE_ASSIGNED";
            } else {
                query.collegeId = collegeId; // Matches exact string, including ""
            }

            if (role === 'Student') {
                // Student sees messages sent specifically TO them OR sent BY them
                query.$or = [
                    { recipientEmail: { $regex: new RegExp(`^${userEmail}$`, 'i') } },
                    { user: req.user._id }
                ];
            }
            else if (role === 'Sir') {
                // TEACHER STRICT FILTER: 
                // OR logic: Direct Message OR (General Message AND Subject Match)

                const directMessageFilter = { recipientEmail: { $regex: new RegExp(`^${userEmail}$`, 'i') } };

                const generalMessageFilter = {
                    recipientEmail: { $in: [null, undefined, ''] }
                };

                // Only add subject filter if subjects exist
                if (subject && subject.length > 0) {
                    generalMessageFilter.targetSubject = { $in: subject };
                } else {
                    generalMessageFilter.targetSubject = "General";
                }

                query.$or = [
                    { ...directMessageFilter },
                    { ...generalMessageFilter }
                ];
            }
            else {
                // Admin (HOD) - Sees all general messages for the college OR Direct Messages
                query.$or = [
                    { recipientEmail: { $regex: new RegExp(`^${userEmail}$`, 'i') } },
                    { recipientEmail: { $in: [null, undefined, ''] } }
                ];
            }
        }

        console.log(`[getMessages] Role: ${role}, Query:`, JSON.stringify(query));
        const messages = await Contact.find(query)
            .populate('user', 'name email department year rollNumber')
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
