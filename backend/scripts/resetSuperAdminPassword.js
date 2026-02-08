require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../src/models/userModel');

const resetAdmin = async () => {
    try {
        const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/quiz-system';
        await mongoose.connect(mongoURI);
        console.log('MongoDB Connected to:', mongoURI);

        // 1. Reset/Update superadmin@quiz.com
        let superUser = await User.findOne({ email: 'superadmin@quiz.com' });
        if (superUser) {
            console.log('Found superadmin@quiz.com. Updating password...');
            superUser.password = 'superadmin123'; // will be hashed by pre-save
            superUser.role = 'Super Admin';
            superUser.isAdmin = true;
            await superUser.save();
            console.log('Updated superadmin@quiz.com successfully.');
        } else {
            console.log('Creating superadmin@quiz.com...');
            await User.create({
                name: 'Super Admin',
                email: 'superadmin@quiz.com',
                password: 'superadmin123',
                isAdmin: true,
                role: 'Super Admin',
                phoneNumber: '0000000000'
            });
            console.log('Created superadmin@quiz.com successfully.');
        }

        // 2. Create/Update harshalhire775@gmail.com
        let harshal = await User.findOne({ email: 'harshalhire775@gmail.com' });
        if (harshal) {
            console.log('Found harshalhire775@gmail.com. Updating password...');
            harshal.password = 'harshal@123';
            harshal.role = 'Super Admin';
            harshal.isAdmin = true;
            await harshal.save();
            console.log('Updated harshalhire775@gmail.com successfully.');
        } else {
            console.log('Creating harshalhire775@gmail.com...');
            await User.create({
                name: 'System Admin',
                email: 'harshalhire775@gmail.com',
                password: 'harshal@123',
                isAdmin: true,
                role: 'Super Admin',
                phoneNumber: '0000000000'
            });
            console.log('Created harshalhire775@gmail.com successfully.');
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

resetAdmin();
