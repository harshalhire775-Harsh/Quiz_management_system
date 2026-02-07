const Question = require('../models/questionModel');
const Quiz = require('../models/quizModel');
const xlsx = require('xlsx');

// Helper to find value in object case-insensitively
const findValue = (row, key) => {
    const foundKey = Object.keys(row).find(k => k.toLowerCase().trim() === key.toLowerCase().trim());
    return foundKey ? row[foundKey] : undefined;
};

// @desc    Get questions by quiz ID
// @route   GET /api/questions/quiz/:quizId
// @access  Private
const getQuestionsByQuiz = async (req, res) => {
    const questions = await Question.find({ quiz: req.params.quizId });
    res.json(questions);
};

// @desc    Add a question to a quiz
// @route   POST /api/questions
// @access  Private/Admin
const addQuestion = async (req, res) => {
    const { quizId, questionText, options, correctAnswer, correctAnswers, type, explanation } = req.body;

    const quiz = await Quiz.findById(quizId);

    if (quiz) {
        const question = new Question({
            quiz: quizId,
            questionText,
            options,
            correctAnswer,
            correctAnswers,
            type: type || 'MCQ',
            explanation
        });

        await question.save();

        // Update numQuestions in Quiz
        quiz.numQuestions = await Question.countDocuments({ quiz: quizId });
        await quiz.save();

        res.status(201).json(question);
    } else {
        res.status(404).json({ message: 'Quiz not found' });
    }
};

// @desc    Update a question
// @route   PUT /api/questions/:id
// @access  Private/Admin
const updateQuestion = async (req, res) => {
    const { questionText, options, correctAnswer, explanation } = req.body;

    const question = await Question.findById(req.params.id);

    if (question) {
        question.questionText = questionText || questionText;
        question.options = options || question.options;
        question.correctAnswer = correctAnswer || question.correctAnswer;
        question.explanation = explanation || question.explanation;

        const updatedQuestion = await question.save();
        res.json(updatedQuestion);
    } else {
        res.status(404).json({ message: 'Question not found' });
    }
};

// @desc    Delete a question
// @route   DELETE /api/questions/:id
// @access  Private/Admin
const deleteQuestion = async (req, res) => {
    const question = await Question.findById(req.params.id);

    if (question) {
        const quizId = question.quiz;
        await question.deleteOne();

        // Update question count in Quiz
        const quiz = await Quiz.findById(quizId);
        if (quiz) {
            quiz.numQuestions = await Question.countDocuments({ quiz: quizId });
            await quiz.save();
        }

        res.json({ message: 'Question removed' });
    } else {
        res.status(404).json({ message: 'Question not found' });
    }
};

// @desc    Bulk upload questions from Excel/CSV
// @route   POST /api/questions/bulk-upload/:quizId
// @access  Private/Admin
const bulkUploadQuestions = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an Excel or CSV file' });
        }

        const quizId = req.params.quizId;
        const quiz = await Quiz.findById(quizId);

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawData = xlsx.utils.sheet_to_json(worksheet, { defval: "" });

        if (rawData.length === 0) {
            return res.status(400).json({ message: 'File is empty' });
        }

        const questionsData = rawData.map((row) => {
            const options = [
                findValue(row, 'Option1'),
                findValue(row, 'Option2'),
                findValue(row, 'Option3'),
                findValue(row, 'Option4')
            ].map(o => o?.toString().trim()).filter(Boolean);

            const type = (findValue(row, 'Type') || 'MCQ').toString().toUpperCase().trim();
            let correctAnswers = [];
            let correctAnswer = '';

            const rawCorrect = findValue(row, 'CorrectAnswer') || '';

            if (type === 'MSQ') {
                correctAnswers = rawCorrect.toString().split(',').map(s => s.trim()).filter(Boolean);
            } else {
                correctAnswer = rawCorrect.toString().trim();
            }

            return {
                quiz: quizId,
                questionText: findValue(row, 'Question') || findValue(row, 'questionText') || findValue(row, 'Question Text'),
                options,
                correctAnswer,
                correctAnswers,
                type: ['MCQ', 'MSQ', 'TF'].includes(type) ? type : 'MCQ',
                explanation: findValue(row, 'Explanation') || ''
            };
        }).filter(q => q.questionText && q.options.length > 0);

        if (questionsData.length === 0) {
            console.log('Sample Row from failed upload:', rawData[0]); // Logging for debugging
            return res.status(400).json({
                message: 'No valid questions found in file',
                details: 'Ensure your columns are named: Question, Option1, Option2, CorrectAnswer'
            });
        }

        const createdQuestions = await Question.insertMany(questionsData);

        quiz.numQuestions = await Question.countDocuments({ quiz: quizId });
        await quiz.save();

        res.status(201).json({
            message: `${createdQuestions.length} questions uploaded successfully`,
            count: createdQuestions.length
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'File processing error', error: error.message });
    }
};

module.exports = {
    getQuestionsByQuiz,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    bulkUploadQuestions
};
