const mongoose = require('mongoose');
const User = require('../src/models/userModel');

const checkSuperAdmins = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/quiz-system');
        console.log('MongoDB Connected');

        const admins = await User.find({ role: 'Admin (HOD)' });
        console.log(`Found ${admins.length} Admin (HOD) users:`);
        admins.forEach(u => console.log(JSON.stringify({ name: u.name, email: u.email, role: u.role }, null, 2)));
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkSuperAdmins();
