const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Department = require('./models/departmentModel');
const User = require('./models/userModel');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const debug = async () => {
    try {
        console.log('--- DEBUGGING DB STATE ---');

        // 1. List All Admins
        const admins = await User.find({ role: 'Admin (HOD)' });
        console.log(`Found ${admins.length} Admins:`);
        admins.forEach(a => console.log(`- ${a.name} (${a.email}) ID: ${a._id}`));

        // 2. List All Departments (Colleges)
        const depts = await Department.find({});
        console.log(`\nFound ${depts.length} Colleges:`);
        depts.forEach(d => console.log(`- ${d.name} | HOD_ID: ${d.hod} | Depts: ${d.departments?.length || 0}`));

        // 3. Check Links
        console.log('\n--- LINK CHECK ---');
        for (const admin of admins) {
            const college = await Department.findOne({ hod: admin._id });
            if (college) {
                console.log(`[OK] Admin ${admin.name} linked to College: ${college.name}`);
            } else {
                console.log(`[ERROR] Admin ${admin.name} has NO COLLEGE linked!`);

                // Try to find by name match or something to auto-fix?
                // Or maybe the college was deleted.
            }
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

debug();
