const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Department = require('./models/departmentModel');
const User = require('./models/userModel');

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const syncHodUsers = async () => {
    await connectDB();

    try {
        const colleges = await Department.find({});
        console.log(`Found ${colleges.length} colleges.`);

        for (const college of colleges) {
            console.log(`Processing College: ${college.name}`);

            // 1. Sync College HOD
            if (college.hod) {
                const head = await User.findById(college.hod);
                if (head) {
                    head.department = college.name;
                    head.role = 'Admin (HOD)'; // Ensure role
                    if (!head.isAdmin) head.isAdmin = true;
                    await head.save();
                    console.log(`  Updated College HOD: ${head.name}`);
                }
            }

            // 2. Sync Sub-Department HODs (Sirs)
            if (college.departments && college.departments.length > 0) {
                for (const subDept of college.departments) {
                    if (subDept.email) {
                        const subUser = await User.findOne({ email: subDept.email });
                        if (subUser) {
                            let changed = false;

                            // Set College Name
                            if (subUser.department !== college.name) {
                                subUser.department = college.name;
                                changed = true;
                            }

                            // Set Subject (Add if missing)
                            const subjectName = subDept.name;
                            if (!subUser.subject.includes(subjectName)) {
                                subUser.subject = [subjectName]; // Reset/Set to this subject as they are HOD
                                changed = true;
                            }

                            // Ensure Role is Sir (or higher)
                            if (subUser.role === 'Student') {
                                subUser.role = 'Sir';
                                changed = true;
                            }

                            if (changed) {
                                await subUser.save();
                                console.log(`  Updated Sub-Dept HOD: ${subUser.name} (${subDept.name})`);
                            } else {
                                console.log(`  Sub-Dept HOD ${subUser.name} already synced.`);
                            }

                            // Update ref in Department if missing
                            if (!subDept.headUserId || subDept.headUserId.toString() !== subUser._id.toString()) {
                                subDept.headUserId = subUser._id;
                                // We can't save subDept directly, need to save college
                                await Department.updateOne(
                                    { _id: college._id, "departments._id": subDept._id },
                                    { $set: { "departments.$.headUserId": subUser._id } }
                                );
                                console.log(`  Linked User ID to Sub-Department: ${subDept.name}`);
                            }

                        } else {
                            console.log(`  WARNING: User not found for email ${subDept.email}`);
                        }
                    }
                }
            }
        }

        console.log('Sync Complete.');
        process.exit();
    } catch (error) {
        console.error('Error syncing:', error);
        process.exit(1);
    }
};

syncHodUsers();
