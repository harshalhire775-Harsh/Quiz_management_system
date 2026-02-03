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

        if (req.user.role === 'Admin (HOD)') {
            // College Admin View
            // 1. Total Students in their college
            totalStudents = await User.countDocuments({ role: 'Student', department: req.user.department });

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
                    department: req.user.department,
                    _id: { $nin: headUserIds }
                });
            } else {
                totalDepartments = 0;
                totalSirs = 0;
            }

            // Total Quizzes (approximate or precise based on creator association)
            // For now, simple count or linked to dept users
            // Let's keep it simple or global if complex, but strict filtering is better
            totalQuizzes = await Quiz.countDocuments(); // Keeping global for now or filter by dept users if needed later

        } else {
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
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #ef4444;">College Account Deactivated ⚠️</h2>
                    <p>Hello <strong>${user.name}</strong>,</p>
                    <p>Your College Account for <strong>${user.department}</strong> has been deactivated by the Super Admin.</p>
                    <p><strong>Impact:</strong> All access for your department (including Teachers and Students) has been suspended.</p>
                    <p>Please contact the administration for further details.</p>
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

            // 2. Cascade Block (Block all users in this department)
            if (user.department) {
                // Use Regex for loose matching (trim whitespace, case insensitive)
                const deptRegex = new RegExp(user.department.trim(), 'i');
                await User.updateMany({ department: { $regex: deptRegex } }, { isBlocked: true });
                // Also update Department status to Sync UI
                await Department.updateOne({ name: { $regex: deptRegex } }, { isActive: false });
                // We also block the HOD again implicitly, ensuring consistency
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
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #10b981;">College Account Reactivated ✅</h2>
                    <p>Hello <strong>${user.name}</strong>,</p>
                    <p>Your College Account for <strong>${user.department}</strong> has been reactivated.</p>
                    <p>All associated Teachers and Students can now log in.</p>
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
            if (user.department) {
                const deptRegex = new RegExp(user.department.trim(), 'i');
                await User.updateMany({ department: { $regex: deptRegex } }, { isBlocked: false });
                await Department.updateOne({ name: { $regex: deptRegex } }, { isActive: true });
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
        department: departmentStr
    });

    if (user) {
        // Send Welcome Email with Credentials
        const emailHtml = `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #4f46e5;">Welcome to QuizPro! 🎓</h2>
                <p>Hello <strong>${user.name}</strong>,</p>
                <p>Your Teacher account has been successfully created for <strong>${departmentStr}</strong>.</p>
                <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Email:</strong> ${user.email}</p>
                    <p style="margin: 5px 0;"><strong>Password:</strong> ${password}</p>
                    <p style="margin: 5px 0;"><strong>Subject(s):</strong> ${Array.isArray(subject) ? subject.join(', ') : subject}</p>
                </div>
                <p>Please log in and change your password if needed.</p>
                <p>Best regards,<br/>QuizPro Admin Team</p>
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

    // Filter by HOD's department (Removed restriction for Sir to view their own dept, kept Sir logic)
    if (req.user.role === 'Sir') {
        query.department = req.user.department;
    }

    // If Admin (HOD), exclude users who are already HODs of a subject (Manage HODs users)
    // to prevent duplicate listing as requested by user.
    if (req.user.role === 'Admin (HOD)') {
        const Department = require('../models/departmentModel');
        const college = await Department.findOne({ hod: req.user._id });
        if (college && college.departments) {
            const headIds = college.departments.map(d => d.headUserId);
            query._id = { $nin: headIds };
        }
    }

    const sirs = await User.find(query).select('-password');
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
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #4f46e5;">Welcome to QuizPro! 🛡️</h2>
                <p>Hello <strong>${user.name}</strong>,</p>
                <p>Your Admin account has been successfully created.</p>
                <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Email:</strong> ${user.email}</p>
                    <p style="margin: 5px 0;"><strong>Password:</strong> ${password}</p>
                </div>
                <p>Please log in and change your password immediately.</p>
                <p>Best regards,<br/>Super Admin</p>
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
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #4f46e5;">New Subjects Assigned! 📚</h2>
                    <p>Hello <strong>${updatedUser.name}</strong>,</p>
                    <p>You have been assigned the following subjects:</p>
                    <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        ${updatedUser.subject.length > 0 ? updatedUser.subject.map(s => `<span style="display:inline-block; background:#fff; padding:5px 10px; margin:5px; border-radius:15px; border:1px solid #e5e7eb; font-weight:bold; color:#4f46e5;">${s}</span>`).join('') : '<p>No subjects assigned.</p>'}
                    </div>
                    <p>Please log in to your dashboard to view details.</p>
                    <p>Best regards,<br/>QuizPro Team</p>
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
            return res.status(400).json({ message: 'Please upload an Excel file or provide user data' });
        }

        console.log(`[BulkRegister] Processing ${rawData.length} records`);

        let successCount = 0;
        let failCount = 0;
        let errors = [];

        // Helper to capitalize first letter
        const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

        for (const rawRow of rawData) {
            // Normalize row keys to lowercase and trim
            const row = {};
            Object.keys(rawRow).forEach(key => {
                row[key.trim().toLowerCase()] = rawRow[key];
            });

            // Extract values using normalized keys with fallbacks for common variations
            const name = row.name || row['full name'] || row['student name'];
            const emailRaw = row.email || row['email address'] || row['email id'];
            const email = emailRaw ? String(emailRaw).trim() : null;

            const phoneNumber = row.phone || row['phone number'] || row['mobile'] || row['contact'];
            const year = row.year;
            const semester = row.semester || row['sem'];
            const subject = row.subject;
            const providedPassword = row.password;

            let roleInput = row.role ? String(row.role).trim() : 'Student';

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
                    name: name || email.split('@')[0],
                    email: email.toLowerCase(),
                    password: finalPassword,
                    role,
                    isAdmin: role === 'Admin (HOD)',
                    isApproved: true,
                    department: row.department || req.user.department || '',
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
                        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                            <h3>Welcome ${user.name}!</h3>
                            <p>An account has been created for you by the administrator.</p>
                            <p><strong>Login Details:</strong></p>
                            <ul>
                                <li>Email: ${user.email}</li>
                                <li>Password: ${finalPassword}</li>
                            </ul>
                            <p>Please login and change your password immediately.</p>
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
            summary: {
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
const getDepartmentStats = async (req, res) => {
    try {
        const department = req.user.department;

        // Fetch College (Department Document) first
        const college = await Department.findOne({ name: department });

        let headUserIds = [];
        let totalSubjects = 0;

        if (college && college.departments) {
            headUserIds = college.departments.map(d => d.headUserId);
            totalSubjects = college.departments.length;
        } else {
            // Fallback for Subjects if college not found (system legacy)
            const teachers = await User.find({ department, role: 'Sir' }).select('subject');
            const subjectsSet = new Set();
            teachers.forEach(t => {
                if (Array.isArray(t.subject)) {
                    t.subject.forEach(s => subjectsSet.add(s));
                } else if (t.subject) {
                    subjectsSet.add(t.subject);
                }
            });
            totalSubjects = subjectsSet.size;
        }

        // 1. Total Teachers (Exclude HODs to match Manage Teachers list)
        const totalTeachers = await User.countDocuments({
            department,
            role: 'Sir',
            _id: { $nin: headUserIds }
        });

        // 2. Total Students
        const totalStudents = await User.countDocuments({ department, role: 'Student' });



        // 4. Total Quizzes (Created by teachers in this department)
        // Find all users in this dept
        const deptUsers = await User.find({ department }).select('_id');
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
            query.department = { $regex: new RegExp(req.user.department, 'i') };
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
