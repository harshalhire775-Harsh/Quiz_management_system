const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// URI from your .env file
const MONGO_URI = 'mongodb://localhost:27017/quiz-system';
const User = require('./src/models/userModel');

const fixUser = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB Connected');

        const email = 'hh@gmail.com';
        const user = await User.findOne({ email });

        if (user) {
            console.log(`Found user: ${user.name}`);

            // Fix College Name if missing
            // Force it to 'gscv' based on 'hhp' user
            if (!user.collegeName) {
                user.collegeName = 'gscv'; // Assuming this is the college
                console.log('Updated collegeName to gscv');
            }

            // Reset Password to '123456'
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash('123456', salt);
            console.log('Password reset to 123456');

            await user.save();
            console.log('User saved successfully.');
        } else {
            console.log('User hh@gmail.com not found.');
        }

        mongoose.connection.close();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

fixUser();
