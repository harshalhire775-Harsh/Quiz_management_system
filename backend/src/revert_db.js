const mongoose = require('mongoose');
const User = require('./models/userModel');
const Department = require('./models/departmentModel');

const MONGO_URI = 'mongodb://localhost:27017/quiz-system';

const revertDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB for Revert');

        // 1. Revert User Departments (Remove "College - " prefix)
        const users = await User.find({ department: / - / });
        for (const user of users) {
            const parts = user.department.split(' - ');
            // Original logic assigned College Name to department field
            const collegeName = parts[0];
            console.log(`Reverting User ${user.email}: '${user.department}' -> '${collegeName}'`);
            user.department = collegeName;
            await user.save();
        }

        // 2. Revert Department Names in Department model
        const colleges = await Department.find({});
        for (const college of colleges) {
            if (college.departments) {
                for (const sd of college.departments) {
                    if (sd.name.includes(' - ')) {
                        const oldName = sd.name;
                        const newName = sd.name.split(' - ').slice(1).join(' - '); // Take everything after first " - "
                        console.log(`Reverting Sub-Dept: '${oldName}' -> '${newName}'`);
                        sd.name = newName;
                    }
                }
                await college.save();
            }
        }

        console.log('Revert complete');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

revertDB();
