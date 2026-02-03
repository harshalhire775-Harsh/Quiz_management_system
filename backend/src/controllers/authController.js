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
        // Send login alert email
        sendMail({
            to: user.email,
            subject: 'New Login Detected 🚨',
            html: `<p>Hi ${user.name},</p><p>A new login was detected on your account.</p>`,
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
    const { name, email, password, phoneNumber, role, isAdmin, department, bio, subject } = req.body;

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
    // Ensure Sirs are not marked as Admins initially if they are pending (though Sir role usually isn't admin)
    const userIsAdmin = isPendingRole ? false : (isAdmin || false);
    const userIsApproved = isPendingRole ? false : true;

    // Use a random password for Pending roles initially
    const finalPassword = isPendingRole ? Math.random().toString(36).slice(-8) : password;

    const user = await User.create({
        name,
        email,
        password: finalPassword,
        phoneNumber,
        role: role || 'Student',
        isAdmin: userIsAdmin,
        isApproved: userIsApproved,
        department: department || '',
        bio: bio || '',
        subject: subject || []
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
                html: `<p>Hi ${user.name},</p><p>Thank you for registering at <strong>QuizPro</strong>. Your account is ready!</p>`,
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

        if (!newPassword) {
            return res.status(400).json({ message: 'New password is required for approval' });
        }

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

        user.password = newPassword; // Will be hashed by pre-save hook
        await user.save();

        // Send Email with Credentials
        await sendMail({
            to: user.email,
            subject: 'Your Account is Approved! ✅',
            html: `
                <h3>Congratulations ${user.name}!</h3>
                <p>Your application for <strong>${user.department || 'QuizPro'}</strong> has been approved.</p>
                <p>Here are your login credentials:</p>
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>College ID:</strong> ${collegeId || 'N/A'}</p>
                    <p style="margin: 5px 0;"><strong>Email:</strong> ${user.email}</p>
                    <p style="margin: 5px 0;"><strong>Password:</strong> ${newPassword}</p>
                </div>
                <p>Please login and change your password immediately.</p>
                <a href="http://localhost:5173/login" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login Now</a>
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
    // If Sir, only show Students from their department
    if (req.user.role === 'Sir') {
        query.department = req.user.department;
        query.role = 'Student';
    }

    // If Admin (HOD) / College Admin:
    // Strictly show ONLY Students. Teachers/HODs are managed in separate views.
    if (req.user.role === 'Admin (HOD)') {
        query.role = 'Student';
    }

    const users = await User.find(query).select('-password').sort('-createdAt');
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
                <h3>Hello ${user.name},</h3>
                <p>Your login credentials have been reset by the Super Admin.</p>
                <p>New Login Details:</p>
                <ul>
                    <li><strong>Email:</strong> ${user.email}</li>
                    <li><strong>Password:</strong> ${newPassword}</li>
                </ul>
                <p>Please login and change your password immediately.</p>
                <a href="http://localhost:5173/login">Login Now</a>
            `
        });

        res.json({ message: 'Credentials reset and sent via email' });

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
                        <h3>Welcome to QuizPro, ${newUser.name}!</h3>
                        <p>Your student account has been created by your administrator.</p>
                        ${user.year ? `<p><strong>Class:</strong> ${user.year} (Sem ${user.semester || 'N/A'})</p>` : ''}
                        <p><strong>Your User ID & Password:</strong></p>
                        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 10px 0;">
                            <p style="margin: 5px 0;"><strong>Email:</strong> ${newUser.email}</p>
                            <p style="margin: 5px 0;"><strong>Password:</strong> ${password}</p>
                        </div>
                        <p>Please login and change your password immediately.</p>
                        <p><a href="http://localhost:5173/login" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login Now</a></p>
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
    bulkRegister
};
