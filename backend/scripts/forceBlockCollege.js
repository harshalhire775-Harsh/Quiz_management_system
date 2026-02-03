const mongoose = require('mongoose');
const User = require('../src/models/userModel');
const Department = require('../src/models/departmentModel');
require('dotenv').config();

const forceBlock = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const deptName = "Sarvjanik Collage";
        const regex = new RegExp(deptName.trim(), 'i');

        console.log(`Blocking everyone + Department matching: ${regex}`);

        // 1. Block Users
        const userResult = await User.updateMany(
            { department: { $regex: regex } },
            { isBlocked: true }
        );
        console.log(`Blocked ${userResult.modifiedCount} users.`);

        // 2. Deactivate Department
        const deptResult = await Department.updateOne(
            { name: { $regex: regex } },
            { isActive: false }
        );
        console.log(`Deactivated Department: ${deptResult.modifiedCount}`);

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

forceBlock();
