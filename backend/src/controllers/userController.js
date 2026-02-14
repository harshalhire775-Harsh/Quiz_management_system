const User = require('../models/userModel');
const Quiz = require('../models/quizModel');
const Department = require('../models/departmentModel');
const { sendMail } = require('../services/emailService');

// @desc    Get system stats
// @route   GET /api/users/stats
// @access  Private/Super Admin
const getSystemStats = async (req, res) => {
    try {
        let totalUsers, totalAdmins, totalSirs, totalStudents, totalQuizzes, totalDepartments, totalHODs = 0;

        const isCollegeAdmin = req.user.role === 'Admin (HOD)';
        const isDeptAdmin = req.user.role === 'Sir' && req.user.isHead;

        if (isCollegeAdmin || isDeptAdmin) {
            // College Admin / Dept Admin View
            if (!req.user.collegeName) {
                return res.json({
                    totalUsers: 0,
                    totalAdmins: 0,
                    totalSirs: 0,
                    totalStudents: 0,
                    totalQuizzes: 0,
                    totalDepartments: 0,
                    totalHODs: 0
                });
            }
            // 1. Total Students in their college
            totalStudents = await User.countDocuments({
                role: 'Student',
                collegeName: req.user.collegeName,
                department: isDeptAdmin ? { $regex: new RegExp(`^${req.user.department}$`, 'i') } : { $exists: true }
            });

            // 2. Fetch College to get Sub-departments (Subjects) info
            const college = await Department.findOne({ hod: req.user._id });

            if (college) {
                // Total Departments = Total Subjects
                totalDepartments = college.departments.length;

                // Total HODs = Total Subject Heads
                totalHODs = college.departments.length; // Each subject has 1 HOD

                // Total Teachers = All Sirs in Dept MINUS HODs (Pure Teachers)
                // Filter out users who are listed as Head of any department
                const headUserIds = college.departments.map(d => d.headUserId);

                totalSirs = await User.countDocuments({
                    role: 'Sir',
                    collegeName: req.user.collegeName,
                    department: isDeptAdmin ? { $regex: new RegExp(`^${req.user.department}$`, 'i') } : { $exists: true },
                    _id: { $nin: headUserIds }
                });
            } else {
                totalSirs = 0;
            }

            // Total Quizzes (Created by users in this college)
            const deptUserIds = await User.find({
                collegeName: req.user.collegeName,
                department: isDeptAdmin ? { $regex: new RegExp(`^${req.user.department}$`, 'i') } : { $exists: true }
            }).distinct('_id');
            totalQuizzes = await Quiz.countDocuments({ createdBy: { $in: deptUserIds } });

        } else if (req.user.role === 'Super Admin') {
            // Super Admin / Global View
            totalUsers = await User.countDocuments();
            totalAdmins = await User.countDocuments({ role: 'Admin (HOD)' });
            totalSirs = await User.countDocuments({ role: 'Sir' });
            totalStudents = await User.countDocuments({ role: 'Student' });
            totalQuizzes = await Quiz.countDocuments();
            totalDepartments = await Department.countDocuments();
            // Super Admin doesn't have "Subject HODs" concept in same way, or it's too nested. 
            // We can leave totalHODs as 0 or count all sub-depts globally if expensive.
            totalHODs = 0;
        }

        res.json({
            totalUsers,
            totalAdmins, // Global or scoped
            totalSirs,
            totalStudents,
            totalQuizzes,
            totalDepartments,
            totalHODs // Added field
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Block a user
// @route   PUT /api/users/:id/block
// @access  Private/Super Admin
const blockUser = async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        if (user.role === 'Super Admin') {
            res.status(400).json({ message: 'Cannot block Super Admin' });
            return;
        }
        if (req.user.role === 'Admin (HOD)' && user.role === 'Admin (HOD)') {
            res.status(403).json({ message: 'HOD cannot block other Admins' });
            return;
        }
        if (req.user.role === 'Sir' && user.role !== 'Student') {
            res.status(403).json({ message: 'Instructors can only block Students' });
            return;
        }
        if (user.role === 'Admin (HOD)') {
            // 1. Send Account Deactivation Email
            const emailHtml = `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                    <div style="background-color: #ef4444; padding: 24px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Account Deactivated</h1>
                    </div>
                    <div style="padding: 32px;">
                        <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">Hello <strong>${user.name}</strong>,</p>
                        <p style="font-size: 16px; color: #4b5563; line-height: 1.5; margin-bottom: 24px;">
                            Your College Account for <strong>${user.department}</strong> has been deactivated by the Super Admin.
                        </p>
                        <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; border-radius: 4px; margin-bottom: 24px;">
                            <p style="margin: 0; font-size: 14px; color: #b91c1c;"><strong>IMPACT:</strong> All access for your department (including Teachers and Students) has been suspended.</p>
                        </div>
                        <p style="font-size: 16px; color: #4b5563; line-height: 1.5;">
                            Please contact the administration for further details.
                        </p>
                    </div>
                    <div style="background-color: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0;">
                         <p style="font-size: 12px; color: #9ca3af; margin: 0;">&copy; ${new Date().getFullYear()} QuizPro System. All rights reserved.</p>
                    </div>
                </div>
            `;
            try {
                await sendMail({
                    to: user.email,
                    subject: 'College Account Deactivated - QuizPro',
                    html: emailHtml
                });
            } catch (err) {
                console.error("Failed to send block email", err);
            }

            // 2. Cascade Block (Block all users in this college/department)
            if (user.collegeName) {
                const query = { collegeName: user.collegeName };
                if (user.role === 'Sir') {
                    query.department = { $regex: new RegExp(`^${user.department.trim()}$`, 'i') };
                }
                await User.updateMany(query, { isBlocked: true });
                if (user.role === 'Admin (HOD)') {
                    await Department.updateOne({ name: user.collegeName }, { isActive: false });
                }
            }
        } else {
            user.isBlocked = true;
            await user.save();
        }

        // Return response (If HOD, we blocked everyone. If not, we saved user).
        // To be safe and ensure 'user' object is updated for response:
        user.isBlocked = true;
        // We don't save again if HOD because updateMany handled it, but save() is safe.
        // Actually updateMany might not trigger pre-save hooks. user.save() does.
        // Let's just return success message.
        res.json({ message: `User ${user.name} and associated access blocked` });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Unblock a user
// @route   PUT /api/users/:id/unblock
// @access  Private/Super Admin
const unblockUser = async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        if (user.role === 'Admin (HOD)') {
            // 1. Send Reactivation Email
            const emailHtml = `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                    <div style="background-color: #10b981; padding: 24px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Account Reactivated</h1>
                    </div>
                    <div style="padding: 32px;">
                        <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">Hello <strong>${user.name}</strong>,</p>
                        <p style="font-size: 16px; color: #4b5563; line-height: 1.5; margin-bottom: 24px;">
                            Your College Account for <strong>${user.department}</strong> has been reactivated.
                        </p>
                        <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; border-radius: 4px; margin-bottom: 24px;">
                            <p style="margin: 0; font-size: 14px; color: #047857;">All associated Teachers and Students can now log in.</p>
                        </div>
                         <div style="margin-top: 32px; text-align: center;">
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" style="background-color: #10b981; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Login Now</a>
                        </div>
                    </div>
                    <div style="background-color: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0;">
                         <p style="font-size: 12px; color: #9ca3af; margin: 0;">&copy; ${new Date().getFullYear()} QuizPro System. All rights reserved.</p>
                    </div>
                </div>
            `;
            try {
                await sendMail({
                    to: user.email,
                    subject: 'College Account Reactivated - QuizPro',
                    html: emailHtml
                });
            } catch (err) {
                console.error("Failed to send unblock email", err);
            }

            // 2. Cascade Unblock
            if (user.collegeName) {
                const query = { collegeName: user.collegeName };
                if (user.role === 'Sir') {
                    query.department = { $regex: new RegExp(`^${user.department.trim()}$`, 'i') };
                }
                await User.updateMany(query, { isBlocked: false });
                if (user.role === 'Admin (HOD)') {
                    await Department.updateOne({ name: user.collegeName }, { isActive: true });
                }
            }
        } else {
            user.isBlocked = false;
            await user.save();
        }

        user.isBlocked = false;
        res.json({ message: `User ${user.name} unblocked` });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Get all admins (HOD)
// @route   GET /api/users/admins
// @access  Private/Super Admin
const getAllAdmins = async (req, res) => {
    const admins = await User.find({ role: { $in: ['Admin (HOD)', 'Super Admin'] } }).select('-password');
    res.json(admins);
};

// @desc    Create Sir (Instructor)
// @route   POST /api/users/sirs
// @access  Private/Admin (HOD) or Super Admin
const createSir = async (req, res) => {
    const { name, email, password, phoneNumber, subject } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400).json({ message: 'User already exists' });
        return;
    }

    // Determine Department: Use requestor's department (for HOD) or from body (if Super Admin)
    const departmentStr = req.user.department || req.body.department || '';

    const user = await User.create({
        name,
        email,
        password,
        phoneNumber,
        role: 'Sir',
        firstName: name,
        subject: Array.isArray(subject) ? subject : (subject ? subject.split(',').map(s => s.trim()) : []),
        department: departmentStr,
        collegeName: req.user.collegeName // Inherit from creator
    });

    if (user) {
        // Send Welcome Email with Credentials
        const emailHtml = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                <div style="background-color: #4f46e5; padding: 24px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Welcome to QuizPro</h1>
                </div>
                <div style="padding: 32px;">
                    <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">Hello <strong>${user.name}</strong>,</p>
                    <p style="font-size: 16px; color: #4b5563; line-height: 1.5; margin-bottom: 24px;">
                        Your Teacher account has been successfully created for <strong>${departmentStr}</strong>.
                    </p>
                    <div style="background-color: #f3f4f6; border-left: 4px solid #4f46e5; padding: 20px; border-radius: 4px; margin-bottom: 24px;">
                        <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Your Credentials</p>
                        <p style="margin: 4px 0; font-size: 16px; color: #111827;"><strong>Email:</strong> ${user.email}</p>
                        <p style="margin: 4px 0; font-size: 16px; color: #111827;"><strong>Password:</strong> ${password}</p>
                        <p style="margin: 4px 0; font-size: 16px; color: #111827;"><strong>Subjects:</strong> ${Array.isArray(subject) ? subject.join(', ') : subject}</p>
                    </div>
                    <p style="font-size: 16px; color: #4b5563; line-height: 1.5;">
                        Please log in and change your password if needed.
                    </p>
                    <div style="margin-top: 32px; text-align: center;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Access Dashboard</a>
                    </div>
                </div>
                <div style="background-color: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0;">
                        <p style="font-size: 12px; color: #9ca3af; margin: 0;">&copy; ${new Date().getFullYear()} QuizPro System. All rights reserved.</p>
                </div>
            </div>
        `;

        try {
            await sendMail({
                to: user.email,
                subject: 'Your Teacher Account Credentials - QuizPro',
                html: emailHtml
            });
        } catch (emailError) {
            console.error("Failed to send welcome email:", emailError);
        }

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            subject: user.subject,
            department: user.department
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

// @desc    Get all Sirs
// @route   GET /api/users/sirs
// @access  Private/Admin (HOD)
// @desc    Get all Sirs (Teachers), excluding Subject Heads (who are shown in Manage HODs)
// @route   GET /api/users/sirs
// @access  Private/Admin (HOD)
const getSirs = async (req, res) => {
    let query = { role: 'Sir' };

    // Filter by HOD's college - MANDATORY for isolation
    if (req.user.role === 'Admin (HOD)' || req.user.role === 'Sir') {
        if (!req.user.collegeName) {
            return res.json([]);
        }
        query.collegeName = req.user.collegeName;
        // If they are a Branch Head, also filter by department
        if (req.user.role === 'Sir') {
            query.department = { $regex: new RegExp(`^${req.user.department}$`, 'i') };
        }
    }

    // If Admin (HOD) or Dept Admin (Sir with isHead), exclude users who are already HODs of a subject
    if (req.user.role === 'Admin (HOD)' || (req.user.role === 'Sir' && req.user.isHead)) {
        // Need to find the college/department document to get headUserIds
        const college = await Department.findOne({
            $or: [
                { hod: req.user._id },
                { "departments.headUserId": req.user._id }
            ]
        });
        if (college && college.departments) {
            const headIds = college.departments.map(d => d.headUserId);
            query._id = { $nin: headIds };
        }
    }

    const sirs = await User.find(query).select('-password');
    console.log(`[getSirs] User: ${req.user.name}, Role: ${req.user.role}, Dept: ${req.user.department}, Query:`, JSON.stringify(query));
    res.json(sirs);
};

// @desc    Create Admin (HOD)
// @route   POST /api/users/admins
// @access  Private/Super Admin
const createAdmin = async (req, res) => {
    const { name, email, password, phoneNumber } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400).json({ message: 'User already exists' });
        return;
    }

    const user = await User.create({
        name,
        email,
        password,
        phoneNumber,
        role: 'Admin (HOD)',
        isAdmin: true, // HOD is admin
    });

    if (user) {
        // Send Welcome Email with Credentials
        const emailHtml = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                <div style="background-color: #4f46e5; padding: 24px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Welcome Admin</h1>
                </div>
                <div style="padding: 32px;">
                    <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">Hello <strong>${user.name}</strong>,</p>
                    <p style="font-size: 16px; color: #4b5563; line-height: 1.5; margin-bottom: 24px;">
                        Your Admin account has been successfully created.
                    </p>
                    <div style="background-color: #f3f4f6; border-left: 4px solid #4f46e5; padding: 20px; border-radius: 4px; margin-bottom: 24px;">
                        <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Login Credentials</p>
                        <p style="margin: 4px 0; font-size: 16px; color: #111827;"><strong>Email:</strong> ${user.email}</p>
                        <p style="margin: 4px 0; font-size: 16px; color: #111827;"><strong>Password:</strong> ${password}</p>
                    </div>
                    <p style="font-size: 16px; color: #4b5563; line-height: 1.5;">
                        Please log in and change your password immediately.
                    </p>
                    <div style="margin-top: 32px; text-align: center;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Access Dashboard</a>
                    </div>
                </div>
                 <div style="background-color: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0;">
                        <p style="font-size: 12px; color: #9ca3af; margin: 0;">&copy; ${new Date().getFullYear()} QuizPro System. All rights reserved.</p>
                </div>
            </div>
        `;

        try {
            await sendMail({
                to: user.email,
                subject: 'Your Admin Account Credentials - QuizPro',
                html: emailHtml
            });
        } catch (emailError) {
            console.error("Failed to send welcome email:", emailError);
        }

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

// @desc    Delete user (HOD can delete Sirs, Super Admin can delete all)
// @route   DELETE /api/users/:id
// @access  Private/Admin
// @desc    Delete user (HOD can delete Sirs, Super Admin can delete all)
// @route   DELETE /api/users/:id
// @access  Private/Admin

// @desc    Delete user (HOD can delete Sirs, Super Admin can delete all)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        // 1. Cannot delete Super Admin
        if (user.role === 'Super Admin') {
            res.status(403).json({ message: 'Cannot delete Super Admin' });
            return;
        }

        // 2. HOD Restrictions
        if (req.user.role === 'Admin (HOD)') {
            // HOD can ONLY delete Sirs or Students
            if (user.role !== 'Sir' && user.role !== 'Student') {
                res.status(403).json({ message: 'HOD can only delete Instructors or Students' });
                return;
            }
        }

        // 3. Sir Restrictions
        if (req.user.role === 'Sir') {
            // Allow deleting Students AND other Instructors (as per requirement)
            if (user.role !== 'Student' && user.role !== 'Sir') {
                res.status(403).json({ message: 'Instructors can only delete Students or Instructors' });
                return;
            }
        }

        // 3. If Deleting a College (HOD), Delete/Block all associated staff and students
        if (user.role === 'Admin (HOD)' && user.department) {
            // Option A: Delete all users in that department
            // await User.deleteMany({ department: user.department });

            // Option B: Just delete the HOD (User).
            // If the Request implies that "It is not logging in", maybe the user simply wasn't deleted?

            // For now, let's ensure we delete the Main User.
            // And if we want to "nuke" the college:
            console.log(`Deleting College: ${user.department}`);

            // Delete all Sirs and Students of this department
            await User.deleteMany({ department: user.department, role: { $in: ['Sir', 'Student'] } });
            await Quiz.deleteMany({ createdBy: { $in: await User.find({ department: user.department }).distinct('_id') } });
        }

        await user.deleteOne();
        res.json({ message: 'User removed' });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Update user subject
// @route   PUT /api/users/:id/subject
// @access  Private/Admin (HOD)
const updateUserSubject = async (req, res) => {
    try {
        const { subject } = req.body;
        const user = await User.findById(req.params.id);

        if (user) {
            // REMOVED RESTRICTIONS included here implicitly

            // Handle subject input (String or Array)
            user.subject = Array.isArray(subject) ? subject : (subject ? subject.split(',').map(s => s.trim()).filter(Boolean) : []);

            const updatedUser = await user.save();

            // Send Email Notification
            const emailHtml = `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                    <div style="background-color: #4f46e5; padding: 24px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">New Subjects Assigned</h1>
                    </div>
                    <div style="padding: 32px;">
                        <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">Hello <strong>${updatedUser.name}</strong>,</p>
                        <p style="font-size: 16px; color: #4b5563; line-height: 1.5; margin-bottom: 24px;">
                            You have been assigned the following subjects:
                        </p>
                        <div style="background-color: #f3f4f6; border-left: 4px solid #4f46e5; padding: 20px; border-radius: 4px; margin-bottom: 24px;">
                             ${updatedUser.subject.length > 0 ? updatedUser.subject.map(s => `<span style="display:inline-block; background:#fff; padding:5px 12px; margin:5px; border-radius:20px; font-weight:bold; color:#4f46e5; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">${s}</span>`).join('') : '<p>No subjects assigned.</p>'}
                        </div>
                        <p style="font-size: 16px; color: #4b5563; line-height: 1.5;">
                            Please log in to your dashboard to view details.
                        </p>
                        <div style="margin-top: 32px; text-align: center;">
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Dashboard</a>
                        </div>
                    </div>
                    <div style="background-color: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0;">
                         <p style="font-size: 12px; color: #9ca3af; margin: 0;">&copy; ${new Date().getFullYear()} QuizPro System. All rights reserved.</p>
                    </div>
                </div>
            `;

            try {
                await sendMail({
                    to: updatedUser.email,
                    subject: 'New Subjects Assigned - QuizPro',
                    html: emailHtml
                });
            } catch (emailError) {
                console.error("Failed to send assignment email:", emailError);
            }

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                subject: updatedUser.subject,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error("Error updating subject:", error);
        res.status(500).json({ message: 'Server Error updating subject', error: error.message });
    }
};

const xlsx = require('xlsx');

// @desc    Bulk Register Users via Excel or JSON
// @route   POST /api/users/bulk-register
// @access  Private/Admin
const bulkRegister = async (req, res) => {
    try {
        let rawData = [];

        if (req.file) {
            const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            rawData = xlsx.utils.sheet_to_json(sheet);
        } else if (req.body && Array.isArray(req.body)) {
            rawData = req.body;
        } else {
            console.error('[BulkRegister] Invalid input format', req.body);
            return res.status(400).json({ message: 'Please upload an Excel file or provide user data' });
        }

        console.log(`[BulkRegister] Processing ${rawData.length} records. User: ${req.user.email}`);

        if (rawData.length > 0) {
            console.log('[BulkRegister] Sample Row:', JSON.stringify(rawData[0]));
        }

        let successCount = 0;
        let failCount = 0;
        let errors = [];

        // Helper to capitalize first letter
        const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

        // SMART COLLEGE RESOLUTION for Legacy HODs
        let resolvedCollegeName = req.user.collegeName;

        if (!resolvedCollegeName && req.user.role === 'Admin (HOD)') {
            // Find which College/Department this HOD belongs to
            const departmentDoc = await Department.findOne({ "departments.headUserId": req.user._id });
            if (departmentDoc) {
                resolvedCollegeName = departmentDoc.name; // This is the College Name (e.g. GSCV)
                console.log(`[BulkRegister] Resolved College Name for Legacy HOD: ${resolvedCollegeName}`);
            } else {
                // If not found in departments list, check if they are the main College Admin
                const collegeDoc = await Department.findOne({ hod: req.user._id });
                if (collegeDoc) {
                    resolvedCollegeName = collegeDoc.name;
                    console.log(`[BulkRegister] Resolved College Name for College Admin: ${resolvedCollegeName}`);
                }
            }
        }

        // Loop through data
        for (const rawRow of rawData) {
            // Validate row structure
            if (!rawRow || typeof rawRow !== 'object') {
                failCount++;
                errors.push({ message: 'Invalid row format' });
                continue;
            }
            // Normalize row keys to lowercase and trim
            const row = {};
            Object.keys(rawRow).forEach(key => {
                row[key.trim().toLowerCase()] = rawRow[key];
            });

            // Extract values using normalized keys with fallbacks for common variations
            const name = row.name || row['full name'] || row['student name'] || rawRow.name;
            const emailRaw = row.email || row['email address'] || row['email id'] || rawRow.email;
            const email = emailRaw ? String(emailRaw).trim() : null;

            const phoneNumber = row.phone || row['phone number'] || row['mobile'] || row['contact'] || rawRow.phoneNumber;
            const year = row.year || rawRow.year;
            const semester = row.semester || row['sem'] || rawRow.semester;
            const subject = row.subject || rawRow.subject;
            const providedPassword = row.password || rawRow.password;

            // Critical: Ensure Department is correctly picked up
            const department = row.department || rawRow.department || req.user.department || '';

            let roleInput = row.role || rawRow.role ? String(row.role || rawRow.role).trim() : 'Student';

            // Normalize Role
            let role = 'Student';
            if (roleInput.toLowerCase() === 'sir') role = 'Sir';
            else if (roleInput.toLowerCase() === 'admin (hod)' || roleInput.toLowerCase() === 'admin') role = 'Admin (HOD)';
            else role = 'Student';

            if (!email) {
                failCount++;
                errors.push({ row: rawRow, message: 'Email missing' });
                continue;
            }

            // check if user exists
            const userExists = await User.findOne({ email: new RegExp(`^${email}$`, 'i') });
            if (userExists) {
                failCount++;
                errors.push({ email, message: 'User already exists' });
                continue;
            }

            // Generate Password if not provided
            const finalPassword = providedPassword ? String(providedPassword) : (Math.random().toString(36).slice(-8) + "!");

            try {
                const userPayload = {
                    name: name || (email ? email.split('@')[0] : 'User'),
                    email: email.toLowerCase(),
                    password: finalPassword,
                    role,
                    isAdmin: role === 'Admin (HOD)',
                    isApproved: true,
                    department: department, // Use our resolved variable
                    collegeName: resolvedCollegeName || req.user.collegeName || department, // Use Resolved Name -> Existing -> or Fallback
                    phoneNumber: phoneNumber ? String(phoneNumber) : undefined,
                    year: year ? String(year).toUpperCase() : undefined,
                    semester: semester ? String(semester) : undefined,
                    subject: subject ? [String(subject)] : []
                };

                const user = await User.create(userPayload);

                // Send Email (Non-blocking)
                sendMail({
                    to: user.email,
                    subject: 'Welcome to QuizPro - Account Created',
                    html: `
                        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                            <div style="background-color: #4f46e5; padding: 24px; text-align: center;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Welcome to QuizPro</h1>
                            </div>
                            <div style="padding: 32px;">
                                <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">Welcome <strong>${user.name}</strong>!</p>
                                <p style="font-size: 16px; color: #4b5563; line-height: 1.5; margin-bottom: 24px;">
                                    An account has been created for you by the administrator.
                                </p>
                                <div style="background-color: #f3f4f6; border-left: 4px solid #4f46e5; padding: 20px; border-radius: 4px; margin-bottom: 24px;">
                                    <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Login Credentials</p>
                                    <p style="margin: 4px 0; font-size: 16px; color: #111827;"><strong>Email:</strong> ${user.email}</p>
                                    <p style="margin: 4px 0; font-size: 16px; color: #111827;"><strong>Password:</strong> ${finalPassword}</p>
                                </div>
                                <p style="font-size: 16px; color: #4b5563; line-height: 1.5;">
                                    Please log in and change your password immediately.
                                </p>
                                <div style="margin-top: 32px; text-align: center;">
                                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Login Now</a>
                                </div>
                            </div>
                            <div style="background-color: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0;">
                                    <p style="font-size: 12px; color: #9ca3af; margin: 0;">&copy; ${new Date().getFullYear()} QuizPro System. All rights reserved.</p>
                            </div>
                        </div>
                   `
                }).catch(err => console.error(`[Email Fail] Could not send email to ${user.email}:`, err));

                successCount++;
            } catch (err) {
                failCount++;
                errors.push({ email, message: err.message });
            }
        }

        res.json({
            message: 'Bulk processing complete',
            results: {
                total: rawData.length,
                success: successCount,
                failed: failCount,
                errors
            }
        });

    } catch (error) {
        console.error("Bulk Register Error:", error);
        res.status(500).json({ message: 'Error processing file' });
    }
};

// @desc    Get department dashboard stats (Teachers, Students, Subjects, Quizzes)
// @route   GET /api/users/dashboard-stats
// @access  Private/Admin (HOD) or Sir
// @desc    Get department dashboard stats (Teachers, Students, Subjects, Quizzes)
// @route   GET /api/users/dashboard-stats
// @access  Private/Admin (HOD) or Sir
const getDepartmentStats = async (req, res) => {
    try {
        const department = req.user.department;
        const collegeName = req.user.collegeName;
        console.log(`[DEBUG Stats] User: ${req.user.name}, Dept: ${department}, College: ${collegeName}, Role: ${req.user.role}`);

        if (!department) {
            return res.json({
                totalTeachers: 0,
                totalStudents: 0,
                totalSubjects: 0,
                totalQuizzes: 0
            });
        }

        // Fetch College (Department Document) first - IF the user is a College Admin
        // But we must be careful. If user is HOD of "Computer Science" (Sub-dept), looking up "Computer Science" in Department model will fail (Correct).
        // If user is HOD of "My College", looking up "My College" will succeed.

        let college = null;
        if (req.user.role === 'Admin (HOD)' && req.user.department === req.user.collegeName) {
            college = await Department.findOne({ name: { $regex: new RegExp(`^${department}$`, 'i') } });
        }

        let headUserIds = [];
        let totalSubjects = 0;

        if (college && college.departments) {
            headUserIds = college.departments.map(d => d.headUserId);
            totalSubjects = college.departments.length;
        } else {
            // Fallback for Subjects: Count unique SUBJECTS taught by REGULAR TEACHERS (excluding HODs)
            const query = {
                department: { $regex: new RegExp(`^${department}$`, 'i') },
                role: 'Sir',
                isHead: { $ne: true } // Exclude HODs
            };
            if (collegeName) query.collegeName = collegeName;

            const teachers = await User.find(query).select('subject');
            const subjectsSet = new Set();
            teachers.forEach(t => {
                if (Array.isArray(t.subject)) {
                    t.subject.forEach(s => subjectsSet.add(s));
                } else if (t.subject) {
                    t.subject.split(',').forEach(s => subjectsSet.add(s.trim()));
                }
            });
            totalSubjects = subjectsSet.size;
        }

        // 1. Total Teachers (Exclude HODs/Department Heads)
        const teacherQuery = {
            department: { $regex: new RegExp(`^${department}$`, 'i') },
            role: 'Sir',
            isHead: { $ne: true }, // Explicitly exclude HODs
            _id: { $nin: headUserIds }
        };
        if (collegeName) teacherQuery.collegeName = collegeName;

        const totalTeachers = await User.countDocuments(teacherQuery);

        // 2. Total Students
        const studentQuery = {
            department: { $regex: new RegExp(`^${department}$`, 'i') },
            role: 'Student'
        };
        if (collegeName) studentQuery.collegeName = collegeName;

        const totalStudents = await User.countDocuments(studentQuery);

        // 4. Total Quizzes (Created by teachers in this department)
        const userQuery = {
            department: { $regex: new RegExp(`^${department}$`, 'i') }
        };
        if (collegeName) userQuery.collegeName = collegeName;

        const deptUsers = await User.find(userQuery).select('_id');
        const deptUserIds = deptUsers.map(u => u._id);

        const totalQuizzes = await Quiz.countDocuments({ createdBy: { $in: deptUserIds } });

        res.json({
            totalTeachers,
            totalStudents,
            totalSubjects,
            totalQuizzes
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get student counts by year (FY, SY, TY)
// @route   GET /api/users/student-years
// @access  Private/Sir or Admin
const getStudentYearStats = async (req, res) => {
    try {
        const department = req.user.department;

        // Match stage
        const match = { role: 'Student' };
        if (department) {
            match.department = { $regex: new RegExp(department, 'i') };
        }

        const [fy, sy, ty] = await Promise.all([
            User.countDocuments({ ...match, year: 'FY' }),
            User.countDocuments({ ...match, year: 'SY' }),
            User.countDocuments({ ...match, year: 'TY' })
        ]);

        res.json({ fy, sy, ty });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get students by year
// @route   GET /api/users/students
// @access  Private/Sir or Admin
const getUsersByYear = async (req, res) => {
    try {
        const { year } = req.query;
        if (!year) return res.status(400).json({ message: 'Year is required' });

        const query = {
            role: 'Student',
            year: year.toUpperCase()
        };

        if (req.user.department) {
            query.department = { $regex: new RegExp(`^${req.user.department}$`, 'i') };
        }

        const students = await User.find(query).select('name email _id rollNumber');
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getSystemStats,
    blockUser,
    unblockUser,
    getAllAdmins,
    createAdmin,
    createSir,
    getSirs,
    deleteUser,
    updateUserSubject,
    bulkRegister,
    getDepartmentStats,
    getStudentYearStats,
    getUsersByYear
};
