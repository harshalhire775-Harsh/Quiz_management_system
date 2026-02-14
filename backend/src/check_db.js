const mongoose = require('mongoose');
const User = require('./models/userModel');
const Department = require('./models/departmentModel');

const MONGO_URI = 'mongodb://localhost:27017/quiz-system';

const checkDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        const depts = await Department.find({}).populate('hod');
        console.log('Departments List:');
        depts.forEach(d => console.log(`'${d.name}' (HOD: ${d.hod?.name}, Email: ${d.hod?.email}, ID: ${d.collegeId})`));
        process.exit();
    } catch (err) {
        process.exit(1);
    }
};
checkDB();
