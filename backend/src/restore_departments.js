const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Department = require('./models/departmentModel');
const User = require('./models/userModel');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const restoreData = async () => {
    try {
        // Find existing admins/HODs
        const harshal = await User.findOne({ email: 'harshalppatil018@gmail.com' });
        const divesh = await User.findOne({ email: 'collegegovernment18@gmail.com' });

        if (harshal) {
            console.log('Restoring Harshal Department...');
            await Department.create({
                name: 'Government Science College',
                description: 'Restored Department',
                hod: harshal._id,
                collegeId: 'CLG-RSTR1',
                adminPassword: 'password123', // Placeholder, update if known
                isActive: true
            });
        }

        if (divesh) {
            console.log('Restoring Divesh Department...');
            await Department.create({
                name: 'Government College', // Or whatever the name was
                description: 'Restored Department',
                hod: divesh._id,
                collegeId: 'CLG-RSTR2',
                adminPassword: 'password123',
                isActive: true
            });
        }

        console.log('Data Restoration Script Completed');
        process.exit();

    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

restoreData();
