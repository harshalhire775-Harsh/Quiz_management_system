const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Contact = require('./src/models/contactModel');
const User = require('./src/models/userModel');

dotenv.config({ path: './.env' });

const fixContactCollegeIds = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Find messages where collegeId is missing OR targetSubject is missing
        const messages = await Contact.find({
            $or: [
                { collegeId: { $exists: false } },
                { collegeId: '' },
                { collegeId: null },
                { targetSubject: { $exists: false } }
            ]
        });

        console.log(`Found ${messages.length} messages to fix.`);

        for (const msg of messages) {
            let user = null;
            if (msg.user) {
                user = await User.findById(msg.user);
            } else {
                user = await User.findOne({ email: msg.email });
            }

            // Fix CollegeId
            if (user && user.collegeId) {
                msg.collegeId = user.collegeId;
            } else if (msg.recipientEmail) {
                const recipient = await User.findOne({ email: msg.recipientEmail });
                if (recipient && recipient.collegeId) {
                    msg.collegeId = recipient.collegeId;
                }
            }

            // Fix TargetSubject if missing
            if (!msg.targetSubject) {
                msg.targetSubject = 'General';
            }

            await msg.save();
            console.log(`Fixed message from ${msg.email} (ID: ${msg._id})`);
        }

        console.log('Done fixing contacts.');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

fixContactCollegeIds();
