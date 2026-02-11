const mongoose = require('mongoose');
const uri = 'mongodb://localhost:27017/quiz-system';

console.log('Testing connection to:', uri);
mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 })
    .then(() => {
        console.log('SUCCESS: Local MongoDB is running!');
        process.exit(0);
    })
    .catch(err => {
        console.error('FAILURE: Local MongoDB failed:', err.message);
        process.exit(1);
    });
