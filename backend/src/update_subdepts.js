const mongoose = require('mongoose');
const User = require('./models/userModel');
const Department = require('./models/departmentModel');

const MONGO_URI = 'mongodb://localhost:27017/quiz-system';

const updateSubDepts = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        const colleges = await Department.find({}).populate('hod');

        for (const college of colleges) {
            if (college.departments && college.departments.length > 0) {
                for (const sd of college.departments) {
                    if (!sd.name.startsWith(college.name)) {
                        const oldName = sd.name;
                        const newName = `${college.name} - ${oldName}`;
                        console.log(`Updating Sub-Dept: '${oldName}' -> '${newName}'`);

                        // Update Dept Head's department
                        if (sd.headUserId) {
                            await User.findByIdAndUpdate(sd.headUserId, {
                                department: newName,
                                isHead: true
                            });
                            console.log(`Updated Head User ID ${sd.headUserId}`);
                        }

                        // Update all students/teachers in that sub-dept
                        // (Wait, how do we know who belongs to that sub-dept if they all have college name?)
                        // If they were assigned to this sub-dept, they usually have the subject in their 'subject' array.

                        await User.updateMany(
                            { department: college.name, subject: oldName },
                            { department: newName }
                        );

                        sd.name = newName;
                    }
                }
                await college.save();
            }
        }
        console.log('Update complete');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};
updateSubDepts();
