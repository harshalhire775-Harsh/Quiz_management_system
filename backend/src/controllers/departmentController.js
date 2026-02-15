const Department = require('../models/departmentModel');
const User = require('../models/userModel');
const Quiz = require('../models/quizModel');
const Question = require('../models/questionModel');
const Result = require('../models/resultModel');
const { sendMail } = require('../services/emailService');
const asyncHandler = require('express-async-handler');

// @desc    Create a new department (College)
// @route   POST /api/departments
// @access  Private/Super Admin
const createDepartment = asyncHandler(async (req, res) => {
    // 1. SUPER ADMIN: Creates a new College (Department Document)
    if (req.user.role === 'Super Admin') {
        const { name, hodName, hodEmail, hodPassword, collegeId: providedId } = req.body;
        const strongId = `CLG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
        const collegeId = providedId || strongId;

        const departmentExists = await Department.findOne({ name });
        if (departmentExists) {
            res.status(400);
            throw new Error('College/Department already exists');
        }

        // Logic to create/find HOD User
        let user = await User.findOne({ email: hodEmail });
        if (!user) {
            user = await User.create({
                name: hodName,
                email: hodEmail,
                password: hodPassword,
                role: 'Admin (HOD)',
                role: 'Admin (HOD)',
                collegeName: name, // The college name they represent
                collegeId: collegeId // Assign College ID
            });
        } else {
            // User exists: Update credentials to match what Admin just set
            user.password = hodPassword;
            if (user.role === 'Student') {
                user.role = 'Admin (HOD)';
            }
            user.collegeName = name;
            user.collegeId = collegeId;
            await user.save();
        }
        // ... (Email sending logic omitted for brevity, assume present or safe to skip repeating here if unchanged) ...
        const emailHtml = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                <div style="background-color: #4f46e5; padding: 24px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Welcome to QuizPro</h1>
                </div>
                <div style="padding: 32px;">
                    <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">Hello <strong>${hodName}</strong>,</p>
                    <p style="font-size: 16px; color: #4b5563; line-height: 1.5; margin-bottom: 24px;">
                        You have been appointed as the <strong>Admin (HOD)</strong> for the <strong>${name}</strong> department at our institution.
                    </p>
                    <div style="background-color: #f3f4f6; border-left: 4px solid #4f46e5; padding: 20px; border-radius: 4px; margin-bottom: 24px;">
                        <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Your Login Credentials</p>
                        <p style="margin: 4px 0; font-size: 16px; color: #111827;"><strong>Email:</strong> ${hodEmail}</p>
                        <p style="margin: 4px 0; font-size: 16px; color: #111827;"><strong>Password:</strong> ${hodPassword}</p>
                    </div>
                    <p style="font-size: 16px; color: #4b5563; line-height: 1.5;">
                        Please log in to your dashboard to start managing your department's quizzes, students, and teachers.
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
            await sendMail({ to: hodEmail, subject: `Welcome Admin - ${name} Department`, html: emailHtml });
        } catch (e) { console.error(e) }

        const department = await Department.create({
            name,
            description: '',
            hod: user._id,
            adminPassword: hodPassword,
            collegeId
        });

        if (department) {
            user.department = name;
            await user.save();
            res.status(201).json(department);
        } else {
            res.status(400);
            throw new Error('Invalid college data');
        }

    }
    // 2. ADMIN (HOD): Creates a Sub-Department (Subject) inside their College
    else if (req.user.role === 'Admin (HOD)') {
        const { name, hodName, hodEmail, hodPassword } = req.body;
        // Find the college this Admin manages
        const college = await Department.findOne({ hod: req.user._id });

        if (!college) {
            res.status(404);
            throw new Error('College not found for this Admin');
        }

        // Check if subject already exists
        const exists = college.departments.find(d => d.name.toLowerCase() === name.toLowerCase());
        if (exists) {
            res.status(400);
            throw new Error('Department/Subject already exists');
        }

        // Create User for this Subject (Teacher Role)
        let user = await User.findOne({ email: hodEmail });
        if (!user) {
            user = await User.create({
                name: hodName,
                email: hodEmail,
                password: hodPassword,
                role: 'Sir',
                department: name, // The branch name
                collegeName: college.name, // The parent college
                subject: [name],
                isHead: true
            });
        } else {
            user.password = hodPassword;
            user.role = 'Sir';
            user.department = name;
            user.collegeName = college.name;
            user.isHead = true;
            if (!user.subject) user.subject = [];
            if (!user.subject.includes(name)) {
                user.subject.push(name);
            }
            await user.save();
        }

        // Email HTML
        const emailHtml = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                <div style="background-color: #4f46e5; padding: 24px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Welcome to QuizPro</h1>
                </div>
                <div style="padding: 32px;">
                    <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">Hello <strong>${hodName}</strong>,</p>
                    <p style="font-size: 16px; color: #4b5563; line-height: 1.5; margin-bottom: 24px;">
                        You have been appointed as the <strong>Head/Teacher</strong> for the <strong>${name}</strong> subject/department under <strong>${college.name}</strong>.
                    </p>
                    <div style="background-color: #f3f4f6; border-left: 4px solid #4f46e5; padding: 20px; border-radius: 4px; margin-bottom: 24px;">
                        <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Your Login Credentials</p>
                        <p style="margin: 4px 0; font-size: 16px; color: #111827;"><strong>Email:</strong> ${hodEmail}</p>
                        <p style="margin: 4px 0; font-size: 16px; color: #111827;"><strong>Password:</strong> ${hodPassword}</p>
                    </div>
                    <p style="font-size: 16px; color: #4b5563; line-height: 1.5;">
                        Please log in to your dashboard to manage your subject.
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
            await sendMail({ to: hodEmail, subject: `Welcome - ${name} Subject Head`, html: emailHtml });
        } catch (e) { console.error(e) }

        // Add to sub-departments
        college.departments.push({
            name,
            head: hodName,
            headUserId: user._id,
            email: hodEmail,
            adminPassword: hodPassword
        });
        await college.save();

        const newSubDept = college.departments[college.departments.length - 1];

        res.status(201).json({
            _id: newSubDept._id,
            name: newSubDept.name,
            hod: { name: hodName, email: hodEmail },
            email: hodEmail,
            adminPassword: hodPassword,
            createdAt: newSubDept.createdAt,
            isActive: true,
            collegeId: 'SUB-DEPT'
        });
    }
});

// @desc    Get all departments (or sub-departments based on role)
// @route   GET /api/departments
// @access  Private/Admin
const getDepartments = async (req, res) => {
    try {
        if (req.user.role === 'Super Admin') {
            // Super Admin sees ALL Colleges
            const departments = await Department.find({}).populate('hod', 'name email');
            res.json(departments);
        } else if (req.user.role === 'Admin (HOD)') {
            // Admin sees ONLY Sub-Departments (Subjects) of their College
            const college = await Department.findOne({ hod: req.user._id });

            if (!college) {
                return res.json([]);
            }

            // Map sub-departments to match the structure expected by the frontend
            const subDepartments = college.departments.map(sub => ({
                _id: sub._id,
                name: sub.name,
                hod: { name: sub.head, email: sub.email }, // Construct HOD object from sub-dept fields
                email: sub.email,
                adminPassword: sub.adminPassword,
                createdAt: sub.createdAt,
                isActive: sub.isActive !== undefined ? sub.isActive : true, // Use actual status
                collegeId: 'SUBJECT'
            }));

            res.json(subDepartments);
        } else {
            res.json([]);
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching departments' });
    }
};

// @desc    Delete a department
// @route   DELETE /api/departments/:id
// @access  Private/Super Admin
const deleteDepartment = async (req, res) => {
    if (req.user.role === 'Super Admin') {
        // Super Admin deletes the whole College AND ALL USERS/DATA inside it
        const department = await Department.findById(req.params.id);

        if (department) {
            // SAFE CLEANUP: Delete all related data first
            // Find quizzes first (so we can delete questions/results linked to them)
            // Fallback to name match for legacy quizzes
            const quizzes = await Quiz.find({
                $or: [
                    { collegeId: department.collegeId },
                    { collegeName: department.name }
                ]
            });
            const quizIds = quizzes.map(q => q._id);

            if (quizIds.length > 0) {
                // Delete Questions
                await Question.deleteMany({ quiz: { $in: quizIds } });
                // Delete Results
                await Result.deleteMany({ quiz: { $in: quizIds } });
                // Delete Quizzes
                await Quiz.deleteMany({ _id: { $in: quizIds } });
            }

            // Smart User Deletion (Handles legacy and new)
            await User.deleteMany({
                $or: [
                    { collegeId: department.collegeId },
                    { collegeName: department.name },
                    { department: { $regex: new RegExp(`^${department.name}$`, 'i') } }
                ]
            });

            // 3. Delete Department
            await department.deleteOne();
            res.json({ message: 'College and all associated data (Users, Quizzes, Results) permanently removed.' });
        } else {
            res.status(404).json({ message: 'College not found' });
        }
    } else if (req.user.role === 'Admin (HOD)') {
        // Admin deletes a Sub-Department (Subject)
        const subDeptId = req.params.id;

        const college = await Department.findOne({ hod: req.user._id });

        if (college) {
            // Check if sub-dept exists
            const subDeptExists = college.departments.find(d => d._id.toString() === subDeptId);

            if (subDeptExists) {
                // Remove it
                college.departments = college.departments.filter(d => d._id.toString() !== subDeptId);
                await college.save();
                res.json({ message: 'Department/Subject removed' });
            } else {
                res.status(404).json({ message: 'Subject not found' });
            }
        } else {
            res.status(404).json({ message: 'College not found' });
        }
    }
};

// @desc    Toggle department status (active/inactive)
// @route   PUT /api/departments/:id/toggle-status
// @access  Private/Admin
const toggleDepartmentStatus = async (req, res) => {
    if (req.user.role === 'Super Admin') {
        // Super Admin toggles College Status
        const department = await Department.findById(req.params.id).populate('hod');
        if (department) {
            department.isActive = !department.isActive;
            const updatedDepartment = await department.save();

            // Cascade Status to All Users (Block/Unblock)
            const deptRegex = new RegExp(department.name.trim(), 'i');
            await User.updateMany(
                { department: { $regex: deptRegex } },
                { isBlocked: !updatedDepartment.isActive }
            );

            // Send Email Notification
            if (department.hod && department.hod.email) {
                const statusText = updatedDepartment.isActive ? 'Reactivated' : 'Deactivated';
                const color = updatedDepartment.isActive ? '#10b981' : '#ef4444';
                const emailHtml = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background-color: ${color}; padding: 24px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Account Status: ${statusText}</h1>
            </div>
            <div style="padding: 32px;">
                <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">Hello <strong>${department.hod.name}</strong>,</p>
                <p style="font-size: 16px; color: #4b5563; line-height: 1.5; margin-bottom: 24px;">
                    Your College Account for <strong>${department.name}</strong> has been <strong>${statusText}</strong> by the Super Admin.
                </p>
                <div style="background-color: ${updatedDepartment.isActive ? '#ecfdf5' : '#fef2f2'}; border-left: 4px solid ${color}; padding: 20px; border-radius: 4px; margin-bottom: 24px;">
                    <p style="margin: 0; font-size: 14px; color: ${updatedDepartment.isActive ? '#047857' : '#b91c1c'};"><strong>IMPACT:</strong> All access for your department (including Teachers and Students) is now <strong>${updatedDepartment.isActive ? 'Restored' : 'Suspended'}</strong>.</p>
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
                        to: department.hod.email,
                        subject: `College Account ${statusText} - QuizPro`,
                        html: emailHtml
                    });
                } catch (e) {
                    console.error("Failed to send status email", e);
                }
            }

            res.json(updatedDepartment);
        } else {
            res.status(404).json({ message: 'Department not found' });
        }
    } else if (req.user.role === 'Admin (HOD)') {
        // Admin (HOD) toggles Sub-Department (Subject) Status
        const subDeptId = req.params.id;
        const college = await Department.findOne({ hod: req.user._id });

        if (college) {
            const subDeptIndex = college.departments.findIndex(d => d._id.toString() === subDeptId);

            if (subDeptIndex !== -1) {
                // Toggle status (initialize to true if undefined)
                const currentStatus = college.departments[subDeptIndex].isActive !== undefined
                    ? college.departments[subDeptIndex].isActive
                    : true;

                college.departments[subDeptIndex].isActive = !currentStatus;
                await college.save();

                // Return the updated sub-dept structure
                const updatedSub = college.departments[subDeptIndex];
                res.json({
                    _id: updatedSub._id,
                    isActive: updatedSub.isActive
                });
            } else {
                res.status(404).json({ message: 'Subject not found' });
            }
        } else {
            res.status(404).json({ message: 'College not found' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized' });
    }
};

// @desc    Add a sub-department to a college
// @route   POST /api/departments/:id/sub-departments
// @access  Private/Admin
const addSubDepartment = async (req, res) => {
    const { name, head } = req.body;
    const department = await Department.findById(req.params.id);

    if (department) {
        const alreadyExists = department.departments.find(d => d.name === name);
        if (alreadyExists) {
            res.status(400).json({ message: 'Department already exists in this college' });
            return;
        }

        department.departments.push({ name, head });
        await department.save();
        res.json(department.departments);
    } else {
        res.status(404).json({ message: 'College not found' });
    }
};

// @desc    Remove a sub-department
// @route   DELETE /api/departments/:id/sub-departments/:subId
// @access  Private/Admin
const removeSubDepartment = async (req, res) => {
    const department = await Department.findById(req.params.id);

    if (department) {
        department.departments = department.departments.filter(
            (d) => d._id.toString() !== req.params.subId
        );
        await department.save();
        res.json(department.departments);
    } else {
        res.status(404).json({ message: 'College not found' });
    }
};


// @desc    Update a department (or sub-department)
// @route   PUT /api/departments/:id
// @access  Private/Admin
const updateDepartment = asyncHandler(async (req, res) => {
    // 1. ADMIN (HOD): Update Sub-Department (Subject)
    if (req.user.role === 'Admin (HOD)') {
        const subDeptId = req.params.id;
        const { adminPassword } = req.body; // Expecting password update

        const college = await Department.findOne({ hod: req.user._id });

        if (!college) {
            res.status(404);
            throw new Error('College not found');
        }

        // Find sub-department
        const subDeptIndex = college.departments.findIndex(d => d._id.toString() === subDeptId);
        if (subDeptIndex === -1) {
            res.status(404);
            throw new Error('Subject/Department not found');
        }

        // Update Password if provided
        if (adminPassword) {
            const subDept = college.departments[subDeptIndex];

            // 1. Update User Password
            // Find user by the email stored in sub-dept
            const user = await User.findOne({ email: subDept.email });
            if (user) {
                user.password = adminPassword;
                await user.save();
            }

            // 2. Update Sub-Dept stored password
            college.departments[subDeptIndex].adminPassword = adminPassword;
            await college.save();

            // Send Email Notification
            if (user) {
                const emailHtml = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #4f46e5; padding: 24px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Password Updated</h1>
            </div>
            <div style="padding: 32px;">
                <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">Hello <strong>${user.name}</strong>,</p>
                <p style="font-size: 16px; color: #4b5563; line-height: 1.5; margin-bottom: 24px;">
                    Your password for the <strong>${college.name} - ${subDept.name}</strong> department has been updated by the College Admin.
                </p>
                <div style="background-color: #f3f4f6; border-left: 4px solid #4f46e5; padding: 20px; border-radius: 4px; margin-bottom: 24px;">
                    <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">New Credentials</p>
                    <p style="margin: 4px 0; font-size: 16px; color: #111827;"><strong>Email:</strong> ${user.email}</p>
                    <p style="margin: 4px 0; font-size: 16px; color: #111827;"><strong>Password:</strong> ${adminPassword}</p>
                </div>
                <p style="font-size: 16px; color: #4b5563; line-height: 1.5;">
                    Please use these new credentials to log in.
                </p>
                <div style="margin-top: 32px; text-align: center;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Login Now</a>
                </div>
            </div>
            <div style="background-color: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="font-size: 12px; color: #9ca3af; margin: 0;">&copy; ${new Date().getFullYear()} QuizPro System. All rights reserved.</p>
            </div>
        </div>
        `;
                try {
                    await sendMail({ to: user.email, subject: `Password Changed - ${subDept.name}`, html: emailHtml });
                } catch (e) {
                    console.error("Failed to send password update email", e);
                }
            }

            res.json({ message: 'Credentials updated successfully', adminPassword });
        } else {
            // Handle other updates if needed in future
            res.status(200).json({ message: 'No changes made' });
        }

    } else {
        res.status(401);
        throw new Error('Not authorized to update this resource');
    }
});

module.exports = {
    createDepartment,
    getDepartments,
    deleteDepartment,
    updateDepartment,
    toggleDepartmentStatus,
    addSubDepartment,
    removeSubDepartment
};
