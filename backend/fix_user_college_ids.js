const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/userModel');
const Department = require('./src/models/departmentModel');

dotenv.config({ path: './.env' });

const fixUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const colleges = await Department.find({});
        console.log(`Found ${colleges.length} colleges.`);

        for (const college of colleges) {
            console.log(`Processing college: ${college.name} (${college.collegeId})`);

            // Update users who have this collegeName but no collegeId (or empty)
            const result = await User.updateMany(
                {
                    collegeName: college.name,
                    $or: [
                        { collegeId: { $exists: false } },
                        { collegeId: '' },
                        { collegeId: null }
                    ]
                },
                { $set: { collegeId: college.collegeId } }
            );

            console.log(`Updated ${result.modifiedCount} users for ${college.name}`);
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

fixUsers();
