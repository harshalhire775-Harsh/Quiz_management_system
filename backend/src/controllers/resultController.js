const Result = require('../models/resultModel');
const Quiz = require('../models/quizModel');
const Question = require('../models/questionModel');
const User = require('../models/userModel');
const { sendMail } = require('../services/emailService');

// @desc    Submit quiz result
// @route   POST /api/results
// @access  Private
const submitResult = async (req, res) => {
    const { quizId, answers } = req.body;

    // Fetch quiz details first
    const quizDetails = await Quiz.findById(quizId);
    if (!quizDetails) {
        res.status(404).json({ message: 'Quiz not found' });
        return;
    }

    const questions = await Question.find({ quiz: quizId });
    let score = 0;
    const processedAnswers = [];

    questions.forEach((q) => {
        const userAnswer = answers.find((a) => a.questionId === q._id.toString());
        const selectedAnswer = userAnswer ? userAnswer.selectedAnswer : null;
        const isCorrect = selectedAnswer === q.correctAnswer;

        if (isCorrect) score++;

        processedAnswers.push({
            question: q._id,
            selectedAnswer,
            isCorrect,
        });
    });

    const result = new Result({
        user: req.user._id,
        quiz: quizId,
        quizTitle: quizDetails.title,
        quizCategory: quizDetails.category,
        score,
        totalQuestions: questions.length,
        correctAnswers: score,
        answers: processedAnswers,
    });

    const createdResult = await result.save();

    // Update User Streak and History
    const user = await User.findById(req.user._id);
    // quizDetails is already fetched

    if (user && quizDetails) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const lastDate = user.streak.lastQuizDate ? new Date(user.streak.lastQuizDate) : null;
        if (lastDate) lastDate.setHours(0, 0, 0, 0);

        if (!lastDate) {
            // First time
            user.streak.current = 1;
        } else {
            const diffTime = Math.abs(today - lastDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                user.streak.current += 1;
            } else if (diffDays > 1) {
                user.streak.current = 1;
            }
            // else diffDays === 0 (already played today): do nothing to streak
        }

        user.streak.lastQuizDate = new Date();

        // Add to History (limit to last 10 for performance)
        user.scoresHistory.push({
            quizTitle: quizDetails.title,
            score: (score / questions.length) * 100,
            date: new Date()
        });

        if (user.scoresHistory.length > 10) {
            user.scoresHistory.shift();
        }

        await user.save();

        // Send result email
        await sendMail({
            to: user.email,
            subject: 'Your QuizPro Result 🎉',
            html: `<p>Hi ${user.name},</p><p>You have completed the quiz <strong>"${quizDetails.title}"</strong> with a score of <strong>${createdResult.score}/${createdResult.totalQuestions}</strong> (${Math.round((createdResult.score / createdResult.totalQuestions) * 100)}%).</p>`,
        });
    }

    res.status(201).json(createdResult);
};

// @desc    Get user results
// @route   GET /api/results/myresults
// @access  Private
const getMyResults = async (req, res) => {
    const results = await Result.find({ user: req.user._id })
        .populate('quiz', 'title category')
        .sort('-createdAt');
    res.json(results);
};

// @desc    Get all results (Admin)
// @route   GET /api/results
// @access  Private/Admin
const getAllResults = async (req, res) => {
    const results = await Result.find({})
        .populate('user', 'name email')
        .populate('quiz', 'title')
        .sort('-createdAt');
    res.json(results);
};

// @desc    Get results by quiz ID
// @route   GET /api/results/quiz/:quizId
// @access  Private/Admin+Sir
const getQuizResults = async (req, res) => {
    const results = await Result.find({ quiz: req.params.quizId })
        .populate('user', 'name email')
        .sort('-createdAt');
    res.json(results);
};

module.exports = {
    submitResult,
    getMyResults,
    getAllResults,
    getQuizResults,
};
