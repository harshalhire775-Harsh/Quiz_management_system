const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../src/models/userModel');

dotenv.config({ path: './.env' });

const listUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const users = await User.find({}, 'name email role isApproved isBlocked isAdmin');
        console.log(`Found ${users.length} users:`);
        users.forEach(u => console.log(`${u.email} | Role: ${u.role} | Approved: ${u.isApproved} | Blocked: ${u.isBlocked} | Admin: ${u.isAdmin}`));

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

listUsers();
