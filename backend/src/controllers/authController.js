const User = require('../models/userModel');
const Department = require('../models/departmentModel');
const generateToken = require('../utils/generateToken');
const { sendMail } = require('../services/emailService');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        sendMail({
            to: user.email,
            subject: 'New Login Detected 🚨',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                    <div style="background-color: #ef4444; padding: 24px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">New Login Detected</h1>
                    </div>
                    <div style="padding: 32px;">
                        <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">Hi <strong>${user.name}</strong>,</p>
                        <p style="font-size: 16px; color: #4b5563; line-height: 1.5; margin-bottom: 24px;">
                            A new login was detected on your QuizPro account.
                        </p>
                        <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; border-radius: 4px; margin-bottom: 24px;">
                            <p style="margin: 0; font-size: 14px; color: #b91c1c;">If this wasn't you, please reset your password immediately.</p>
                        </div>
                        <div style="margin-top: 32px; text-align: center;">
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" style="background-color: #ef4444; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Secure Account</a>
                        </div>
                    </div>
                    <div style="background-color: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0;">
                        <p style="font-size: 12px; color: #9ca3af; margin: 0;">&copy; ${new Date().getFullYear()} QuizPro System. All rights reserved.</p>
                    </div>
                </div>
            `,
        });

        if (user.isBlocked) {
            res.status(403).json({ message: 'Your account has been blocked. Please contact Super Admin.' });
            return;
        }

        if (user.isApproved === false) {
            res.status(403).json({ message: 'Account pending approval. Please wait for Super Admin verification.' });
            return;
        }

        // Check if user is a Department Head
        const deptHeadCheck = await Department.findOne({ "departments.headUserId": user._id });
        const isHead = !!deptHeadCheck;

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber,
            profileImage: user.profileImage,
            bio: user.bio,
            isAdmin: user.isAdmin,
            role: user.role,
            isHead, // Added this flag
            subject: user.subject,
            department: user.department,
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password, phoneNumber, role, isAdmin, department, bio, subject, collegeName } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400).json({ message: 'User already exists' });
        return;
    }

    // Security: Prevent creating new Super Admins via public registration
    if (role === 'Super Admin') {
        res.status(403).json({ message: 'Super Admin registration is restricted.' });
        return;
    }

    // If role is Admin (HOD) or Sir, force approval required and no admin access yet
    const isPendingRole = ['Admin (HOD)', 'Sir'].includes(role);
    const userIsAdmin = isPendingRole ? false : (isAdmin || false);
    const userIsApproved = isPendingRole ? false : true;

    // Simplest fix:
    const effectivePassword = password || Math.random().toString(36).slice(-8);

    const user = await User.create({
        name,
        email,
        password: effectivePassword,
        phoneNumber: phoneNumber || '',
        role: role || 'Student',
        isAdmin: userIsAdmin,
        isApproved: userIsApproved,
        department: department || '',
        collegeName: collegeName || (role === 'Admin (HOD)' ? department : ''), // Mapping for HODs
        bio: bio || '',
        subject: subject || [],
        firstName: name,
        lastName: '',
    });

    if (user) {
        if (isPendingRole) {
            // Send notification to Super Admin (Simulated)
            console.log(`[EMAIL SENT] To: Super Admin/HOD | Subject: New Application | Body: User ${name} (${email}) has applied as ${role}. Please review.`);

            res.status(201).json({
                message: 'Application submitted successfully. Pending approval.',
                success: true
            });
        } else {
            // Send welcome email
            await sendMail({
                to: user.email,
                subject: 'Welcome to QuizPro 🎉',
                html: `
                    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                        <div style="background-color: #4f46e5; padding: 24px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Welcome to QuizPro</h1>
                        </div>
                        <div style="padding: 32px;">
                            <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">Hi <strong>${user.name}</strong>,</p>
                            <p style="font-size: 16px; color: #4b5563; line-height: 1.5; margin-bottom: 24px;">
                                Thank you for registering at <strong>QuizPro</strong>. Your account has been successfully created and is ready to use!
                            </p>
                            <div style="margin-top: 32px; text-align: center;">
                                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Go to Dashboard</a>
                            </div>
                        </div>
                        <div style="background-color: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="font-size: 12px; color: #9ca3af; margin: 0;">&copy; ${new Date().getFullYear()} QuizPro System. All rights reserved.</p>
                        </div>
                    </div>
                `,
            });
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                profileImage: user.profileImage,
                bio: user.bio,
                isAdmin: user.isAdmin,
                role: user.role,
                token: generateToken(user._id),
                success: true
            });
        }
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

// @desc    Approve User (HOD approves Sirs, Super Admin approves all)
// @route   PUT /api/users/:id/approve
// @access  Private/Admin
// @desc    Approve User (HOD approves Sirs, Super Admin approves all)
// @route   PUT /api/users/:id/approve
// @access  Private/Admin
const approveUser = async (req, res) => {
    try {
        const { newPassword, collegeId, collegeName } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isApproved) {
            return res.status(400).json({ message: 'User is already approved' });
        }

        // Access Control: HOD can only approve Sirs
        // Super Admin can approve anyone
        if (req.user.role === 'Admin (HOD)' && user.role !== 'Sir') {
            return res.status(403).json({ message: 'You can only approve Instructors.' });
        }

        // if (!newPassword) {
        //     return res.status(400).json({ message: 'New password is required for approval' });
        // }

        // Update College Name if provided (fixes missing department name issue)
        if (collegeName) {
            user.department = collegeName;
        }

        user.isApproved = true;

        if (user.role === 'Admin (HOD)') {
            if (!user.department) {
                return res.status(400).json({ message: 'College Name is required. Please provide it.' });
            }

            user.isAdmin = true;

            // Create Department/College Record if it doesn't exist
            // Check if department with this name already exists
            const existingDept = await Department.findOne({ name: user.department });

            if (!existingDept) {
                await Department.create({
                    name: user.department, // This comes from the registration form 'collegeName' mapped to 'department'
                    hod: user._id,
                    collegeId: collegeId || `CLG-${Math.floor(1000 + Math.random() * 9000)}`,
                    adminPassword: newPassword, // Storing for 'Manage Colleges' view reference
                    description: user.bio || '' // Using bio as address/description
                });
            } else {
                // If it exists (maybe re-registering?), update the HOD
                existingDept.hod = user._id;
                existingDept.adminPassword = newPassword;
                if (collegeId) existingDept.collegeId = collegeId;
                await existingDept.save();
            }
        }

        if (newPassword) {
            user.password = newPassword; // Will be hashed by pre-save hook
        }
        await user.save();

        // Send Email with Credentials
        await sendMail({
            to: user.email,
            subject: 'Your Account is Approved! ✅',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                    <div style="background-color: #10b981; padding: 24px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Account Approved</h1>
                    </div>
                    <div style="padding: 32px;">
                        <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">Congratulations <strong>${user.name}</strong>!</p>
                        <p style="font-size: 16px; color: #4b5563; line-height: 1.5; margin-bottom: 24px;">
                            Your application for <strong>${user.department || 'QuizPro'}</strong> has been approved. You can now access your account.
                        </p>
                        <div style="background-color: #f4fdf9; border-left: 4px solid #10b981; padding: 20px; border-radius: 4px; margin-bottom: 24px;">
                            <p style="margin: 0 0 10px 0; font-size: 14px; color: #047857; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Login Credentials</p>
                            <p style="margin: 4px 0; font-size: 16px; color: #111827;"><strong>College ID:</strong> ${collegeId || 'N/A'}</p>
                            <p style="margin: 4px 0; font-size: 16px; color: #111827;"><strong>Email:</strong> ${user.email}</p>
                            <p style="margin: 4px 0; font-size: 16px; color: #111827;"><strong>Password:</strong> ${newPassword || '<i>(Use the custom password you set during registration)</i>'}</p>
                        </div>
                        <p style="font-size: 16px; color: #4b5563; line-height: 1.5;">
                            Please log in and change your password immediately.
                        </p>
                        <div style="margin-top: 32px; text-align: center;">
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" style="background-color: #10b981; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Login Now</a>
                        </div>
                    </div>
                    <div style="background-color: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0;">
                         <p style="font-size: 12px; color: #9ca3af; margin: 0;">&copy; ${new Date().getFullYear()} QuizPro System. All rights reserved.</p>
                    </div>
                </div>
            `
        });

        res.json({ message: 'User approved, College Created, and credentials sent via email' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        // Check if user is a Department Head
        const deptHeadCheck = await Department.findOne({ "departments.headUserId": user._id });
        const isHead = !!deptHeadCheck;

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber,
            profileImage: user.profileImage,
            bio: user.bio,
            isAdmin: user.isAdmin,
            role: user.role,
            isHead,
            subject: user.subject,
            department: user.department,
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.phoneNumber = req.body.phoneNumber || user.phoneNumber;

            if (req.body.profileImage !== undefined) {
                user.profileImage = req.body.profileImage;
            }

            if (req.body.bio !== undefined) {
                user.bio = req.body.bio;
            }

            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phoneNumber: updatedUser.phoneNumber,
                profileImage: updatedUser.profileImage,
                bio: updatedUser.bio,
                isAdmin: updatedUser.isAdmin,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    let query = {};
    // If HOD or Sir, only show Students from their department
    // Role-based filtering
    if (req.user.role === 'Sir' || req.user.role === 'Admin (HOD)') {

        // Only use collegeName filter IF IT EXISTS. 
        // This allows legacy users (without collegeName) to still see their department students.
        if (req.user.collegeName) {
            query.collegeName = req.user.collegeName;
        }

        // If Sir, OR if Admin (HOD) but strict Department Mode (Sub-dept admin)
        // If HOD is managing "Maths", show only "Maths" students.
        // But if HOD is "Principal" (College Name == Dept Name), show all.
        const isCollegeAdmin = req.user.collegeName && (req.user.department === req.user.collegeName);

        if (req.user.role === 'Sir' || (req.user.role === 'Admin (HOD)' && !isCollegeAdmin)) {
            // If department exists, always filter by it. Crucial for legacy HOD.
            if (req.user.department) {
                query.department = { $regex: new RegExp(`^${req.user.department}$`, 'i') };
            }
        }

        query.role = 'Student';
    }

    const users = await User.find(query).select('-password').sort('-createdAt');
    console.log(`[getUsers] User: ${req.user.name}, Role: ${req.user.role}, Dept: ${req.user.department}, Query:`, JSON.stringify(query));
    res.json(users);
};

const deleteUser = async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        if (user.role === 'Super Admin') {
            res.status(400).json({ message: 'Cannot delete Super Admin' });
            return;
        }
        await user.deleteOne();
        res.json({ message: 'User removed' });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};



// @desc    Resend Credentials (Reset Password)
// @route   PUT /api/auth/users/:id/resend-credentials
// @access  Private/SuperAdmin
const resendCredentials = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.isApproved) {
            return res.status(400).json({ message: 'User is not approved yet. Approve them first.' });
        }

        // Generate new random password
        const newPassword = Math.random().toString(36).slice(-8) + "!";

        user.password = newPassword;
        await user.save();

        await sendMail({
            to: user.email,
            subject: 'Login Credentials Reset 🔑',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                    <div style="background-color: #f59e0b; padding: 24px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Credentials Reset</h1>
                    </div>
                    <div style="padding: 32px;">
                        <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">Hello <strong>${user.name}</strong>,</p>
                        <p style="font-size: 16px; color: #4b5563; line-height: 1.5; margin-bottom: 24px;">
                            Your login credentials have been reset by the Super Admin.
                        </p>
                        <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 4px; margin-bottom: 24px;">
                            <p style="margin: 0 0 10px 0; font-size: 14px; color: #b45309; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">New Details</p>
                            <p style="margin: 4px 0; font-size: 16px; color: #111827;"><strong>Email:</strong> ${user.email}</p>
                            <p style="margin: 4px 0; font-size: 16px; color: #111827;"><strong>Password:</strong> ${newPassword}</p>
                        </div>
                        <p style="font-size: 16px; color: #4b5563; line-height: 1.5;">
                            Please log in and change your password immediately.
                        </p>
                        <div style="margin-top: 32px; text-align: center;">
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" style="background-color: #f59e0b; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Login Now</a>
                        </div>
                    </div>
                    <div style="background-color: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0;">
                         <p style="font-size: 12px; color: #9ca3af; margin: 0;">&copy; ${new Date().getFullYear()} QuizPro System. All rights reserved.</p>
                    </div>
                </div>
            `
        });

        res.json({ message: 'Credentials reset and sent via email' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Change User Password (Admin Manual Override)
// @route   PUT /api/auth/users/:id/change-password
// @access  Private/Admin
const changeUserPassword = async (req, res) => {
    try {
        const { password } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!password || password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        // Access Control (HOD can only change Sir/Student)
        if (req.user.role === 'Admin (HOD)' && user.role === 'Super Admin') {
            return res.status(403).json({ message: 'Not authorized to change Super Admin password' });
        }

        user.password = password;
        await user.save();

        await sendMail({
            to: user.email,
            subject: 'Password Changed by Admin 🔐',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                    <div style="background-color: #8b5cf6; padding: 24px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Password Updated</h1>
                    </div>
                    <div style="padding: 32px;">
                        <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">Hello <strong>${user.name}</strong>,</p>
                        <p style="font-size: 16px; color: #4b5563; line-height: 1.5; margin-bottom: 24px;">
                            Your account password has been manually updated by the administrator.
                        </p>
                        <div style="background-color: #f5f3ff; border-left: 4px solid #8b5cf6; padding: 20px; border-radius: 4px; margin-bottom: 24px;">
                            <p style="margin: 0 0 10px 0; font-size: 14px; color: #7c3aed; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">New Password</p>
                            <p style="margin: 4px 0; font-size: 16px; color: #111827;"><strong>Password:</strong> ${password}</p>
                        </div>
                        <p style="font-size: 16px; color: #4b5563; line-height: 1.5;">
                            Use this new password to log in.
                        </p>
                        <div style="margin-top: 32px; text-align: center;">
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" style="background-color: #8b5cf6; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Login Now</a>
                        </div>
                    </div>
                </div>
            `
        });

        res.json({ message: 'Password updated successfully and emailed to user.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Bulk Register Users (from Excel)
// @route   POST /api/auth/bulk-register
// @access  Private/Admin
const bulkRegister = async (req, res) => {
    try {
        const users = req.body; // Expecting array of objects { name, email, phoneNumber }

        if (!Array.isArray(users) || users.length === 0) {
            return res.status(400).json({ message: 'No users provided' });
        }

        const results = {
            success: 0,
            failed: 0,
            errors: []
        };

        for (const user of users) {
            // Basic validation
            if (!user.email || !user.name) {
                results.failed++;
                results.errors.push({ email: user.email || 'Unknown', error: 'Missing name or email' });
                continue;
            }

            // Check existence
            const userExists = await User.findOne({ email: user.email });
            if (userExists) {
                results.failed++;
                results.errors.push({ email: user.email, error: 'User already exists' });
                continue;
            }

            // Generate Password or Use Provided
            const password = user.password || Math.random().toString(36).slice(-8);

            try {
                const newUser = await User.create({
                    name: user.name,
                    email: user.email,
                    phoneNumber: user.phoneNumber || '',
                    password: password,
                    role: 'Student', // Default to Student
                    isApproved: true,
                    isAdmin: false,
                    department: req.user.department || '', // Link to creator's department
                    year: user.year || '',
                    semester: user.semester || '',
                    subject: user.subject ? [user.subject] : []
                });

                // Send Email
                await sendMail({
                    to: newUser.email,
                    subject: 'You have been registered on QuizPro! 🎓',
                    html: `
                        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                            <div style="background-color: #4f46e5; padding: 24px; text-align: center;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Welcome to QuizPro</h1>
                            </div>
                            <div style="padding: 32px;">
                                <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">Welcome <strong>${newUser.name}</strong>!</p>
                                <p style="font-size: 16px; color: #4b5563; line-height: 1.5; margin-bottom: 24px;">
                                    Your student account has been created by your administrator.
                                </p>
                                ${user.year ? `<p style="font-size: 16px; color: #4b5563;"><strong>Class:</strong> ${user.year} (Sem ${user.semester || 'N/A'})</p>` : ''}
                                <div style="background-color: #f3f4f6; border-left: 4px solid #4f46e5; padding: 20px; border-radius: 4px; margin-bottom: 24px;">
                                    <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Login Credentials</p>
                                    <p style="margin: 4px 0; font-size: 16px; color: #111827;"><strong>Email:</strong> ${newUser.email}</p>
                                    <p style="margin: 4px 0; font-size: 16px; color: #111827;"><strong>Password:</strong> ${password}</p>
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
                });

                results.success++;
            } catch (err) {
                results.failed++;
                results.errors.push({ email: user.email, error: err.message });
            }
        }

        res.json({ message: 'Bulk registration completed', results });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    authUser,
    registerUser,
    getUserProfile,
    updateUserProfile,
    getUsers,
    deleteUser,
    approveUser,
    resendCredentials,
    changeUserPassword,
    bulkRegister
};
