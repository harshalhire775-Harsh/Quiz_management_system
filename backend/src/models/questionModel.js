const mongoose = require('mongoose');

const questionSchema = mongoose.Schema(
    {
        quiz: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Quiz',
            required: true,
        },
        questionText: {
            type: String,
            required: true,
        },
        options: [
            {
                type: String,
                required: true,
            },
        ],
        correctAnswer: {
            type: String, // For MCQ Single / TF
        },
        correctAnswers: [{
            type: String, // For MCQ Multiple
        }],
        type: {
            type: String,
            enum: ['MCQ', 'MSQ', 'TF'],
            default: 'MCQ',
        },
        explanation: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
