const mongoose = require('mongoose');
const User = require('./models/userModel');
const Department = require('./models/departmentModel');

const MONGO_URI = 'mongodb://localhost:27017/quiz-system';

const cleanup = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB');

        // 1. Trim Departments in Users
        const users = await User.find({});
        for (const user of users) {
            if (user.department) {
                const trimmed = user.department.trim();
                if (user.department !== trimmed) {
                    console.log(`Trimming User ${user.email}: '${user.department}' -> '${trimmed}'`);
                    user.department = trimmed;
                    await user.save();
                }
            }
        }

        // 2. Trim Department names in Department model
        const depts = await Department.find({});
        for (const dept of depts) {
            const trimmed = dept.name.trim();
            if (dept.name !== trimmed) {
                console.log(`Trimming Dept: '${dept.name}' -> '${trimmed}'`);
                dept.name = trimmed;
                await dept.save();
            }
            // Also trim sub-departments
            if (dept.departments) {
                dept.departments.forEach(sd => {
                    sd.name = sd.name.trim();
                });
                await dept.save();
            }
        }

        console.log('Cleanup complete');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

cleanup();
