const Question = require('../models/questionModel');
const Quiz = require('../models/quizModel');
const xlsx = require('xlsx');

// Helper to find value in object case-insensitively and with common aliases
const findValue = (row, aliases) => {
    const keys = Object.keys(row);
    for (const alias of aliases) {
        const foundKey = keys.find(k => k.toLowerCase().replace(/[^a-z0-9]/g, '') === alias.toLowerCase().replace(/[^a-z0-9]/g, ''));
        if (foundKey) return row[foundKey];
    }
    return undefined;
};

// @desc    Get questions by quiz ID
const getQuestionsByQuiz = async (req, res) => {
    // Security Check
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    if (req.user.role !== 'Super Admin') {
        if (req.user.collegeId && quiz.collegeId !== req.user.collegeId) {
            return res.status(403).json({ message: 'Forbidden' });
        }
    }

    const questions = await Question.find({ quiz: req.params.quizId });
    res.json(questions);
};

// @desc    Add a question to a quiz
const addQuestion = async (req, res) => {
    const { quizId, questionText, options, correctAnswer, correctAnswers, type, explanation } = req.body;
    const quiz = await Quiz.findById(quizId);
    if (quiz) {
        // Ownership Check
        if (req.user.role !== 'Super Admin') {
            if (quiz.collegeId !== req.user.collegeId) {
                return res.status(403).json({ message: 'Forbidden' });
            }
            if (req.user.role === 'Sir' && quiz.createdBy.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Not authorized' });
            }
        }
        const question = new Question({
            quiz: quizId, questionText, options, correctAnswer, correctAnswers,
            type: type || 'MCQ', explanation
        });
        await question.save();
        quiz.numQuestions = await Question.countDocuments({ quiz: quizId });
        await quiz.save();
        res.status(201).json(question);
    } else {
        res.status(404).json({ message: 'Quiz not found' });
    }
};

// @desc    Update a question
const updateQuestion = async (req, res) => {
    const { questionText, options, correctAnswer, explanation } = req.body;
    const question = await Question.findById(req.params.id);
    if (question) {
        // Security Check
        const quiz = await Quiz.findById(question.quiz);
        if (req.user.role !== 'Super Admin') {
            if (quiz.collegeId !== req.user.collegeId) return res.status(403).json({ message: 'Forbidden' });
            if (req.user.role === 'Sir' && quiz.createdBy.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
        }
        question.questionText = questionText || question.questionText;
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
const deleteQuestion = async (req, res) => {
    const question = await Question.findById(req.params.id);
    if (question) {
        const quizId = question.quiz;
        // Security Check
        const quiz = await Quiz.findById(quizId);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        if (req.user.role !== 'Super Admin') {
            if (quiz.collegeId !== req.user.collegeId) return res.status(403).json({ message: 'Forbidden' });
            if (req.user.role === 'Sir' && quiz.createdBy.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
        }
        await question.deleteOne();

        // Update stats
        quiz.numQuestions = await Question.countDocuments({ quiz: quizId });
        await quiz.save();
        res.json({ message: 'Question removed' });
    } else {
        res.status(404).json({ message: 'Question not found' });
    }
};

// @desc    Bulk upload questions from Excel/CSV
const bulkUploadQuestions = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an Excel or CSV file' });
        }

        const quizId = req.params.quizId;
        const quiz = await Quiz.findById(quizId);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        // Ownership Check
        if (req.user.role !== 'Super Admin') {
            if (quiz.collegeId !== req.user.collegeId) {
                return res.status(403).json({ message: 'Forbidden' });
            }
            if (req.user.role === 'Sir' && quiz.createdBy.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Not authorized' });
            }
        }

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawData = xlsx.utils.sheet_to_json(worksheet, { defval: "" });

        if (rawData.length === 0) return res.status(400).json({ message: 'File is empty' });

        const questionsData = rawData.map((row, index) => {
            const questionText = findValue(row, ['Question', 'QuestionText', 'QText', 'Q', 'Title']);
            const opt1 = findValue(row, ['Option1', 'Opt1', 'A']);
            const opt2 = findValue(row, ['Option2', 'Opt2', 'B']);
            const opt3 = findValue(row, ['Option3', 'Opt3', 'C']);
            const opt4 = findValue(row, ['Option4', 'Opt4', 'D']);
            const rawCorrect = findValue(row, ['CorrectAnswer', 'Correct', 'Answer', 'Ans']);
            const typeStr = (findValue(row, ['Type']) || 'MCQ').toString().toUpperCase().trim();
            const explanation = findValue(row, ['Explanation', 'Exp', 'Details']) || '';

            const options = [opt1, opt2, opt3, opt4].map(o => o?.toString().trim()).filter(Boolean);

            let correctAnswers = [];
            let correctAnswer = '';

            if (typeStr === 'MSQ') {
                correctAnswers = rawCorrect ? rawCorrect.toString().split(',').map(s => s.trim()).filter(Boolean) : [];
            } else {
                correctAnswer = rawCorrect ? rawCorrect.toString().trim() : '';
            }

            return {
                quiz: quizId,
                questionText: questionText ? questionText.toString().trim() : '',
                options,
                correctAnswer,
                correctAnswers,
                type: ['MCQ', 'MSQ', 'TF'].includes(typeStr) ? typeStr : 'MCQ',
                explanation: explanation.toString().trim()
            };
        }).filter(q => q.questionText && q.options.length >= 2);

        if (questionsData.length === 0) {
            const foundKeys = Object.keys(rawData[0] || {}).join(', ');
            return res.status(400).json({
                message: 'No valid questions found in file',
                details: `Headers found: [${foundKeys}]. Expected headers like: Question, Option1, Option2, CorrectAnswer.`
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
    getQuestionsByQuiz, addQuestion, updateQuestion, deleteQuestion, bulkUploadQuestions
};
