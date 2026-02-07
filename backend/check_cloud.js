const mongoose = require('mongoose');
const User = require('./src/models/userModel');

const CLOUD_URI = 'mongodb+srv://harshalhire775_db_user:hdzeYlQxGvfTad6T@cluster0.izepf9g.mongodb.net/quiz-system';

const check = async () => {
    try {
        await mongoose.connect(CLOUD_URI);
        console.log('Connected to Cloud');

        const count = await User.countDocuments();
        console.log(`Total Users in Cloud: ${count}`);

        const users = await User.find({}).limit(5);
        users.forEach(u => console.log(`- ${u.name} (${u.email})`));

        // List all collections to be sure
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('\nCollections found:');
        collections.forEach(c => console.log(`- ${c.name}`));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

check();
