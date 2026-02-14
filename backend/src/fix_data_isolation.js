const mongoose = require('mongoose');
const User = require('./models/userModel');
const Department = require('./models/departmentModel');

async function fixData() {
    try {
        await mongoose.connect('mongodb://localhost:27017/quiz-system');
        console.log('Connected to DB...');

        const users = await User.find({});
        console.log(`Checking ${users.length} users...`);

        for (const user of users) {
            // If collegeName is empty, try to populate it
            if (!user.collegeName) {
                if (user.role === 'Admin (HOD)') {
                    // For HOD, collegeName is their department name
                    user.collegeName = user.department;
                } else if (user.role === 'Sir' || user.role === 'Student') {
                    // For Sir/Student, their department field currently holds the college name
                    // In the old system, department was used for college name
                    user.collegeName = user.department;
                }

                if (user.collegeName) {
                    await user.save();
                    console.log(`Updated ${user.name} with collegeName: ${user.collegeName}`);
                }
            }
        }

        console.log('Finished updating users.');

        // Also ensure HODs have isAdmin: true if they lost it in reverts
        await User.updateMany({ role: 'Admin (HOD)' }, { isAdmin: true });

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fixData();
