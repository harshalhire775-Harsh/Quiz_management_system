const Quiz = require('../models/quizModel');
const Question = require('../models/questionModel');
const User = require('../models/userModel');
const { sendMail } = require('../services/emailService');

// @desc    Get all quizzes (Approved only for public, all for Admin/HOD)
// @route   GET /api/quizzes
// @access  Public
const getQuizzes = async (req, res) => {
    // If Admin (HOD) or Sir, return all (or maybe filtered for Sir). For now, let's keep it simple.
    // Actually, Students should only see approved. Admins might need to see all to approve.
    // Since this route is 'Public' in previous implementation, we need to check user if possible, 
    // but better: Create a separate /pending route for HOD.
    // For standard /api/quizzes, let's return ONLY approved quizzes.
    // Modifying to show all PUBLISHED quizzes, regardless of approval status, 
    // because the Teacher expects "Publish" to make it live.
    // Also ensures DRAFTS (Approved but not Published) are NOT shown.
    const quizzes = await Quiz.find({ isActive: true, isPublished: true });
    res.json(quizzes);
};

// @desc    Get pending quizzes for HOD
// @route   GET /api/quizzes/pending
// @access  Private/Admin (HOD)
const getPendingQuizzes = async (req, res) => {
    const quizzes = await Quiz.find({ isApproved: false }).populate('createdBy', 'name email');
    res.json(quizzes);
};

// @desc    Approve a quiz
// @route   PUT /api/quizzes/:id/approve
// @access  Private/Admin (HOD)
const approveQuiz = async (req, res) => {
    const quiz = await Quiz.findById(req.params.id);

    if (quiz) {
        quiz.isApproved = true;
        quiz.approvedBy = req.user._id;
        const updatedQuiz = await quiz.save();

        // Notify Creator? (Optional)

        res.json(updatedQuiz);
    } else {
        res.status(404).json({ message: 'Quiz not found' });
    }
};

// @desc    Get quiz by ID
// @route   GET /api/quizzes/:id
// @access  Public
const getQuizById = async (req, res) => {
    const quiz = await Quiz.findById(req.params.id);

    if (quiz) {
        res.json(quiz);
    } else {
        res.status(404).json({ message: 'Quiz not found' });
    }
};

// @desc    Get quizzes created by logged in Sir
// @route   GET /api/quizzes/my-quizzes
// @access  Private/Sir
const getMyQuizzes = async (req, res) => {
    const quizzes = await Quiz.find({ createdBy: req.user._id });
    res.json(quizzes);
};

// @desc    Create a quiz
// @route   POST /api/quizzes
// @access  Private/Sir
// In createQuiz
const createQuiz = async (req, res) => {
    const { title, description, category, targetYear, duration, scheduledDate, totalMarks, passingMarks, allowedAttempts, negativeMarks } = req.body;

    // Strict check: HOD/Super Admin cannot create quizzes
    if (req.user.role !== 'Sir') {
        res.status(403).json({ message: 'Only Sir/Instructors can create quizzes.' });
        return;
    }

    const quiz = new Quiz({
        title,
        description,
        category,
        targetYear: targetYear || 'All',
        duration,
        scheduledDate: scheduledDate || null,
        totalMarks: totalMarks || 100,
        passingMarks: passingMarks || 40,
        allowedAttempts: allowedAttempts || 0,
        negativeMarks: negativeMarks || 0,
        createdBy: req.user._id,
        isApproved: false, // Default pending
        isPublished: false, // Default draft
    });

    const createdQuiz = await quiz.save();

    // Notify HODs about new quiz? (Optional)

    res.status(201).json(createdQuiz);
};

// @desc    Update a quiz
// @route   PUT /api/quizzes/:id
// @access  Private/Instructor
const updateQuiz = async (req, res) => {
    const { title, description, category, targetYear, duration, scheduledDate, isActive, isPublished, totalMarks, passingMarks, allowedAttempts, negativeMarks } = req.body;

    const quiz = await Quiz.findById(req.params.id);

    if (quiz) {
        // Only creator or Admin can update?
        // Let's say only Creator (Sir)
        if (quiz.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'Admin (HOD)' && req.user.role !== 'Super Admin') {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }

        quiz.title = title || quiz.title;
        quiz.description = description || quiz.description;
        quiz.category = category || quiz.category;
        quiz.targetYear = targetYear || quiz.targetYear;
        quiz.duration = duration || quiz.duration;
        quiz.scheduledDate = scheduledDate !== undefined ? scheduledDate : quiz.scheduledDate;
        quiz.isActive = isActive !== undefined ? isActive : quiz.isActive;
        quiz.isPublished = isPublished !== undefined ? isPublished : quiz.isPublished;
        quiz.totalMarks = totalMarks || quiz.totalMarks;
        quiz.passingMarks = passingMarks || quiz.passingMarks;
        quiz.allowedAttempts = allowedAttempts !== undefined ? allowedAttempts : quiz.allowedAttempts;
        quiz.negativeMarks = negativeMarks !== undefined ? negativeMarks : quiz.negativeMarks;

        const updatedQuiz = await quiz.save();
        res.json(updatedQuiz);
    } else {
        res.status(404).json({ message: 'Quiz not found' });
    }
};

// @desc    Delete a quiz
// @route   DELETE /api/quizzes/:id
// @access  Private/Admin
const deleteQuiz = async (req, res) => {
    const quiz = await Quiz.findById(req.params.id);

    if (quiz) {
        if (req.user.role === 'Super Admin') { // Redundant check if middleware handles it, but safe.
            // Allow HOD to delete? Yes.
            // Allow Sir to delete own? Maybe.
        }
        await Question.deleteMany({ quiz: req.params.id });
        await quiz.deleteOne();
        res.json({ message: 'Quiz removed' });
    } else {
        res.status(404).json({ message: 'Quiz not found' });
    }
};

module.exports = {
    getQuizzes,
    getPendingQuizzes,
    getMyQuizzes,
    approveQuiz,
    getQuizById,
    createQuiz,
    updateQuiz,
    deleteQuiz,
};
