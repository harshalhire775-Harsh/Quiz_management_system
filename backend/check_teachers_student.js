const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/userModel');

dotenv.config({ path: './.env' });

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        console.log('\n--- STUDENTS ---');
        const students = await User.find({ role: 'Student' }, 'name email collegeId collegeName');
        students.forEach(s => console.log(`Name: ${s.name} | Email: ${s.email} | CollegeId: ${s.collegeId} | CollegeName: ${s.collegeName}`));

        console.log('\n--- SIRS (TEACHERS) ---');
        const teachers = await User.find({ role: 'Sir' }, 'name email collegeId collegeName isHead isAdmin');
        teachers.forEach(t => console.log(`Name: ${t.name} | Email: ${t.email} | CollegeId: ${t.collegeId} | CollegeName: ${t.collegeName} | isHead: ${t.isHead} | isAdmin: ${t.isAdmin}`));

        const Department = require('./src/models/departmentModel');
        console.log('\n--- DEPARTMENTS (COLLEGES) ---');
        const colls = await Department.find({}, 'name collegeId');
        colls.forEach(c => console.log(`College: ${c.name} | CollegeId: ${c.collegeId}`));

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkUsers();
