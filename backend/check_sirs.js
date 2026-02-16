const mongoose = require('mongoose');
const User = require('./src/models/userModel');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const checkSirs = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log('--- ALL USERS WITH ROLE: SIR ---');
        const sirs = await User.find({ role: 'Sir' });

        sirs.forEach(u => {
            console.log(`Name: ${u.name}, Email: ${u.email}, Role: ${u.role}, isHead: ${u.isHead}, isAdmin: ${u.isAdmin}, Department: ${u.department}, CollegeId: ${u.collegeId}`);
        });

        console.log('\n--- QUERY TEST: role=Sir, isHead!=${true}, isAdmin=false ---');
        const filtered = await User.find({ role: 'Sir', isHead: { $ne: true }, isAdmin: false });
        filtered.forEach(u => {
            console.log(`[KEPT] Name: ${u.name}, Email: ${u.email}`);
        });

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkSirs();
