const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../src/models/userModel');

dotenv.config({ path: './.env' }); // Adjusted for running from backend root

const createSir = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const sirEmail = 'sir@example.com';
        const sirPassword = 'password123';

        const userExists = await User.findOne({ email: sirEmail });

        if (userExists) {
            console.log('Sir user already exists.');
            console.log(`Email: ${sirEmail}`);
            // We can't show password as it's hashed
            console.log('If you forgot the password, please delete the user from DB or use the "Forgot Password" feature (if available).');
        } else {
            const user = await User.create({
                name: 'Test Sir',
                email: sirEmail,
                password: sirPassword,
                role: 'Sir',
                subject: 'Mathematics', // Default subject
                phoneNumber: '1234567890'
            });
            console.log('Sir user created successfully!');
            console.log(`Email: ${sirEmail}`);
            console.log(`Password: ${sirPassword}`);
        }

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

createSir();
