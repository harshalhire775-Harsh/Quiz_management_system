const mongoose = require('mongoose');
const User = require('./src/models/userModel');
const Department = require('./src/models/departmentModel');
const Quiz = require('./src/models/quizModel');
const Question = require('./src/models/questionModel');
const Result = require('./src/models/resultModel');
const Contact = require('./src/models/contactModel');

const LOCAL_URI = 'mongodb://localhost:27017/quiz-system';
const CLOUD_URI = 'mongodb+srv://harshalhire775_db_user:hdzeYlQxGvfTad6T@cluster0.izepf9g.mongodb.net/quiz-system';

const migrate = async () => {
    try {
        console.log('--- DB MIGRATION BEGUN ---');

        // Connect to Source (Local)
        const sourceConn = await mongoose.createConnection(LOCAL_URI).asPromise();
        console.log('Connected to Source (Local)');

        // Connect to Target (Cloud)
        const targetConn = await mongoose.createConnection(CLOUD_URI).asPromise();
        console.log('Connected to Target (Cloud)');

        const collections = [
            { name: 'User', model: User },
            { name: 'Department', model: Department },
            { name: 'Quiz', model: Quiz },
            { name: 'Question', model: Question },
            { name: 'Result', model: Result },
            { name: 'Contact', model: Contact }
        ];

        for (const col of collections) {
            console.log(`Migrating ${col.name}s...`);

            // Get data from source
            const sourceModel = sourceConn.model(col.name, col.model.schema);
            const data = await sourceModel.find({}).lean();
            console.log(`  Found ${data.length} records in ${col.name}`);

            if (data.length > 0) {
                const targetModel = targetConn.model(col.name, col.model.schema);
                // Clear target collection first to avoid duplicates if re-running
                await targetModel.deleteMany({});
                // Insert data
                await targetModel.insertMany(data);
                console.log(`  Successfully inserted ${data.length} records into Cloud.`);
            }
        }

        console.log('--- MIGRATION COMPLETED SUCCESSFULLY ---');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();
