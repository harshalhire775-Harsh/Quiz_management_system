const mongoose = require('mongoose');
const User = require('../src/models/userModel');
require('dotenv').config();

const forceUnblock = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const deptName = "Sarvjanik Collage";
        const regex = new RegExp(deptName.trim(), 'i'); // Loose match

        console.log(`Unblocking everyone in department matching: ${regex}`);

        const result = await User.updateMany(
            { department: { $regex: regex } },
            { isBlocked: false }
        );

        console.log(`Matched and Unblocked ${result.modifiedCount} users.`);
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

forceUnblock();
