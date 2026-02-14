const mongoose = require('mongoose');
const User = require('./backend/src/models/userModel');
const dotenv = require('dotenv');

dotenv.config({ path: './backend/.env' });

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const usersCount = await User.countDocuments();
        console.log(`Total Users: ${usersCount}`);

        const depts = await User.distinct('department');
        console.log('Unique Departments in Users:', depts);

        const roles = await User.distinct('role');
        console.log('Unique Roles in Users:', roles);

        const usersWithNoDept = await User.find({ department: { $in: [null, undefined, ""] } }).select('name role email');
        console.log('Users with NO department:', usersWithNoDept.length);
        if (usersWithNoDept.length > 0) {
            console.log('Sample users with no dept:', usersWithNoDept.slice(0, 5));
        }

        const hods = await User.find({ role: 'Admin (HOD)' }).select('name department email');
        console.log('HODs list:', hods);

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkDB();
