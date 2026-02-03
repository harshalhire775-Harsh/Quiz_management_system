const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Department = require('./models/departmentModel');
const User = require('./models/userModel');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const repair = async () => {
    try {
        console.log('--- REPAIRING DB ---');

        const adminsToFix = [
            { email: 'harshalppatil018@gmail.com', collegeName: 'Government Science College' },
            { email: 'collegegovernment18@gmail.com', collegeName: 'Government College' }
        ];

        for (const target of adminsToFix) {
            const user = await User.findOne({ email: target.email });
            if (!user) {
                console.log(`User ${target.email} not found.`);
                continue;
            }

            // Check if linked
            const existingCollege = await Department.findOne({ hod: user._id });
            if (existingCollege) {
                console.log(`[OK] ${user.name} is already linked to ${existingCollege.name}`);
            } else {
                console.log(`[FIXING] ${user.name} has no college. Linking/Creating...`);

                // Check if college exists by name but lost link
                let college = await Department.findOne({ name: target.collegeName });
                if (college) {
                    college.hod = user._id;
                    await college.save();
                    console.log(`-> Linked existing college '${college.name}' to ${user.name}`);
                } else {
                    // Create new
                    await Department.create({
                        name: target.collegeName,
                        hod: user._id,
                        collegeId: 'FIX-' + Math.floor(Math.random() * 1000),
                        adminPassword: 'password123',
                        isActive: true
                    });
                    console.log(`-> Created NEW college '${target.collegeName}' for ${user.name}`);
                }
            }
        }

        console.log('Repair Complete');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

repair();
