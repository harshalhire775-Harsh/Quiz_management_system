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

    // STRICT ISOLATION CHECK
    const userCollegeId = req.user.collegeId;
    const quizCollegeId = quizDetails.collegeId;

    if (userCollegeId && quizCollegeId && userCollegeId !== quizCollegeId) {
        return res.status(403).json({ message: 'Forbidden: Access denied to this college quiz.' });
    }
    // Fallback for legacy data without collegeId (using collegeName)
    if (!userCollegeId && quizDetails.collegeName !== req.user.collegeName) {
        return res.status(403).json({ message: 'Forbidden: Access denied to this college quiz.' });
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
        collegeName: req.user.collegeName,
        collegeId: req.user.collegeId,
        department: req.user.department,
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
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                    <div style="background-color: #4f46e5; padding: 24px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Quiz Completed!</h1>
                    </div>
                    <div style="padding: 32px;">
                        <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">Hi <strong>${user.name}</strong>,</p>
                        <p style="font-size: 16px; color: #4b5563; line-height: 1.5; margin-bottom: 24px;">
                            You have successfully completed the quiz <strong>"${quizDetails.title}"</strong>.
                        </p>
                        <div style="background-color: #f3f4f6; border-left: 4px solid #4f46e5; padding: 20px; border-radius: 4px; margin-bottom: 24px;">
                            <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Your Score</p>
                            <p style="margin: 0; font-size: 32px; font-weight: 800; color: #4f46e5;">
                                ${Math.round((createdResult.score / createdResult.totalQuestions) * 100)}%
                            </p>
                            <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">
                                (${createdResult.score} / ${createdResult.totalQuestions} Correct)
                            </p>
                        </div>
                        <p style="font-size: 16px; color: #4b5563; line-height: 1.5;">
                            Keep up the great work! Log in to view detailed analytics.
                        </p>
                        <div style="margin-top: 32px; text-align: center;">
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Analysis</a>
                        </div>
                    </div>
                    <div style="background-color: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0;">
                         <p style="font-size: 12px; color: #9ca3af; margin: 0;">&copy; ${new Date().getFullYear()} QuizPro System. All rights reserved.</p>
                    </div>
                </div>
            `,
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
    let query = {};

    if (req.user.role !== 'Super Admin') {
        if (!req.user.collegeName && !req.user.collegeId) {
            return res.json([]);
        }
        if (req.user.collegeId) {
            query.collegeId = req.user.collegeId;
        } else {
            query.collegeName = req.user.collegeName;
        }

        if (req.user.role === 'Sir') {
            query.department = req.user.department;
        }
    }

    const results = await Result.find(query)
        .populate('user', 'name email')
        .populate('quiz', 'title')
        .sort('-createdAt');
    res.json(results);
};

// @desc    Get results by quiz ID
// @route   GET /api/results/quiz/:quizId
// @access  Private/Admin+Sir
const getQuizResults = async (req, res) => {
    let query = { quiz: req.params.quizId };
    if (req.user.role !== 'Super Admin') {
        if (req.user.collegeId) query.collegeId = req.user.collegeId;
        else if (req.user.collegeName) query.collegeName = req.user.collegeName;
    }

    const results = await Result.find(query)
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
