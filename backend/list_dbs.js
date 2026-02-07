const mongoose = require('mongoose');
const CLOUD_URI = 'mongodb+srv://harshalhire775_db_user:hdzeYlQxGvfTad6T@cluster0.izepf9g.mongodb.net/quiz-system';

const listDBs = async () => {
    try {
        const client = await mongoose.connect(CLOUD_URI);
        const admin = client.connection.db.admin();
        const dbs = await admin.listDatabases();
        console.log('Databases on this cluster:');
        dbs.databases.forEach(db => console.log(`- ${db.name}`));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};
listDBs();
