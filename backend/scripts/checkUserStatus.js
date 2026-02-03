const mongoose = require('mongoose');
const User = require('../src/models/userModel');
require('dotenv').config();

const checkStatus = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const deptRegex = /Sarvjanik/i;
        const users = await User.find({ department: deptRegex });

        console.log('\n--- USERS IN SARVJANIK ---');
        users.forEach(u => {
            console.log(`User: [${u.name}] Role: [${u.role}] Blocked: [${u.isBlocked}] Dept: [${u.department}]`);
        });

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkStatus();
