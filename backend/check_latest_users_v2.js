const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' }); // Look for .env relative to script location in backend folder

const User = require('./src/models/userModel'); // Adjust path to models

const checkLatestUsers = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            console.error('MONGO_URI is missing from .env');
            process.exit(1);
        }
        await mongoose.connect(uri);
        console.log('MongoDB Connected');

        // Fetch last 5 created users
        const users = await User.find().sort({ createdAt: -1 }).limit(5);

        console.log('--- LATEST 5 USERS ---');
        users.forEach(u => {
            console.log(`Name: ${u.name}`);
            console.log(`Email: ${u.email}`);
            console.log(`Role: ${u.role}`);
            console.log(`College Name: ${u.collegeName}`);
            console.log(`Department: ${u.department}`);
            console.log(`Password (Hash Length): ${u.password ? u.password.length : 'MISSING'}`);
            console.log(`IsApproved: ${u.isApproved}`);
            console.log(`IsBlocked: ${u.isBlocked}`);
            console.log('------------------------');
        });

        // Check specifically for 'harshal hh'
        const specific = await User.findOne({ name: { $regex: 'harshal', $options: 'i' } });
        if (specific) {
            console.log('--- SPECIFIC USER "harshal" ---');
            console.log(`Name: ${specific.name}`);
            console.log(`Email: ${specific.email}`);
            console.log(`Password Hash: ${specific.password.substring(0, 10)}... (Length: ${specific.password.length})`);
        } else {
            console.log('User "harshal" not found in DB.');
        }

        mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkLatestUsers();
