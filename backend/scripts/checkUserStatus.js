const mongoose = require('mongoose');
const User = require('../src/models/userModel');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const checkStatus = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const deptRegex = /Sarvjanik/i;
        const users = await User.find({ department: deptRegex });

        console.log('\n--- USERS IN SARVJANIK ---');
        users.forEach(u => {
            console.log(`User: [${u.name}] Role: [${u.role}] Blocked: [${u.isBlocked}] Dept: [${u.department}] CollegeId: [${u.collegeId}] Subject: [${u.subject}] Email: [${u.email}]`);
        });

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkStatus();
