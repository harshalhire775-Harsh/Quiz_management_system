const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Contact = require('./src/models/contactModel');
const User = require('./src/models/userModel');

dotenv.config({ path: './.env' });

const debugMessages = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const latestMessages = await Contact.find({}).sort({ createdAt: -1 }).limit(5);
        console.log('\n--- LATEST 5 MESSAGES ---');
        latestMessages.forEach(m => {
            console.log(`ID: ${m._id} | From: ${m.name} (${m.email}) | To: ${m.recipientEmail} | Subject: ${m.subject} | TargetSub: ${m.targetSubject} | CollegeId: ${m.collegeId}`);
        });

        console.log('\n--- TEACHERS INFO ---');
        const teachers = await User.find({ role: 'Sir' }, 'name email subject collegeId collegeName');
        teachers.forEach(t => {
            console.log(`Name: ${t.name} | Email: ${t.email} | Subjects: ${JSON.stringify(t.subject)} | CollegeId: ${t.collegeId}`);
        });

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

debugMessages();
