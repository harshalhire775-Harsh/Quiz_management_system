const Quiz = require('../models/quizModel');
const Question = require('../models/questionModel');
const User = require('../models/userModel');
const { sendMail } = require('../services/emailService');
const xlsx = require('xlsx');

// Helper to find value in object case-insensitively
const findValue = (row, key) => {
    const foundKey = Object.keys(row).find(k => k.toLowerCase().trim() === key.toLowerCase().trim());
    return foundKey ? row[foundKey] : undefined;
};

// @desc    Get all quizzes (Approved only for public, all for Admin/HOD)
// @desc    Get all quizzes (Approved only for public, all for Admin/HOD)
const getQuizzes = async (req, res) => {
    try {
        let query = { isActive: true, isPublished: true };

        if (req.user && req.user.role !== 'Super Admin') {
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

        const quizzes = await Quiz.find(query);
        res.json(quizzes);
    } catch (error) {
        console.error("Error in getQuizzes:", error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get pending quizzes for HOD
const getPendingQuizzes = async (req, res) => {
    try {
        let query = { isApproved: false };

        if (req.user && req.user.role !== 'Super Admin') {
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

        const quizzes = await Quiz.find(query).populate('createdBy', 'name email');
        res.json(quizzes);
    } catch (error) {
        console.error("Error in getPendingQuizzes:", error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Approve a quiz
const approveQuiz = async (req, res) => {
    const quiz = await Quiz.findById(req.params.id);
    if (quiz) {
        quiz.isApproved = true;
        quiz.approvedBy = req.user._id;
        const updatedQuiz = await quiz.save();
        res.json(updatedQuiz);
    } else {
        res.status(404).json({ message: 'Quiz not found' });
    }
};

const getQuizById = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (quiz) {
            if (req.user && req.user.role !== 'Super Admin') {
                const userCollegeId = req.user.collegeId;
                const quizCollegeId = quiz.collegeId;

                if (userCollegeId && quizCollegeId && userCollegeId !== quizCollegeId) {
                    return res.status(403).json({ message: 'Forbidden: Access denied to this college quiz.' });
                }
                if (!userCollegeId && quiz.collegeName !== req.user.collegeName) {
                    return res.status(403).json({ message: 'Forbidden: Access denied to this college quiz.' });
                }
            }
            res.json(quiz);
        } else {
            res.status(404).json({ message: 'Quiz not found' });
        }
    } catch (error) {
        console.error("Error in getQuizById:", error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const getMyQuizzes = async (req, res) => {
    const quizzes = await Quiz.find({ createdBy: req.user._id });
    res.json(quizzes);
};

const createQuiz = async (req, res) => {
    const { title, description, category, targetYear, duration, scheduledDate, totalMarks, passingMarks, allowedAttempts, negativeMarks } = req.body;
    if (req.user.role !== 'Sir') {
        res.status(403).json({ message: 'Only Sir/Instructors can create quizzes.' });
        return;
    }
    const quiz = new Quiz({
        title, description, category, targetYear: targetYear || 'All',
        duration, scheduledDate: scheduledDate || null,
        totalMarks: totalMarks || 100, passingMarks: passingMarks || 40,
        allowedAttempts: allowedAttempts || 0, negativeMarks: negativeMarks || 0,
        createdBy: req.user._id,
        collegeName: req.user.collegeName,
        collegeId: req.user.collegeId,
        department: req.user.department,
        isApproved: false,
        isPublished: false,
    });
    const createdQuiz = await quiz.save();
    res.status(201).json(createdQuiz);
};

const updateQuiz = async (req, res) => {
    const { title, description, category, targetYear, duration, scheduledDate, isActive, isPublished, totalMarks, passingMarks, allowedAttempts, negativeMarks } = req.body;
    const quiz = await Quiz.findById(req.params.id);
    if (quiz) {
        // 1. Ownership Check: Only Creator, HOD of THAT College, or Super Admin
        if (req.user.role !== 'Super Admin') {
            if (quiz.collegeId !== req.user.collegeId) {
                return res.status(403).json({ message: 'Forbidden: Access denied to this college quiz.' });
            }
            if (req.user.role === 'Sir' && quiz.createdBy.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Not authorized' });
            }
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

const deleteQuiz = async (req, res) => {
    const quiz = await Quiz.findById(req.params.id);
    if (quiz) {
        // Strict Deletion Policy
        if (req.user.role !== 'Super Admin') {
            if (quiz.collegeId !== req.user.collegeId) {
                return res.status(403).json({ message: 'Forbidden' });
            }
            if (req.user.role === 'Sir' && quiz.createdBy.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Not authorized to delete this quiz' });
            }
        }
        await Question.deleteMany({ quiz: req.params.id });
        await quiz.deleteOne();
        res.json({ message: 'Quiz removed' });
    } else {
        res.status(404).json({ message: 'Quiz not found' });
    }
};

const bulkUploadQuizzes = async (req, res) => {
    try {
        if (req.user.role !== 'Sir') {
            return res.status(403).json({ message: 'Only Sir/Instructors can upload quizzes.' });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an Excel or CSV file' });
        }
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawData = xlsx.utils.sheet_to_json(worksheet, { defval: "" });

        if (rawData.length === 0) {
            return res.status(400).json({ message: 'File is empty' });
        }

        const quizzesData = rawData.map((row) => ({
            title: findValue(row, 'Title') || findValue(row, 'Quiz Title'),
            description: findValue(row, 'Description') || '',
            category: findValue(row, 'Category') || 'General',
            targetYear: findValue(row, 'TargetYear') || findValue(row, 'Year') || 'All',
            duration: parseInt(findValue(row, 'Duration')) || 60,
            scheduledDate: findValue(row, 'ScheduledDate') || null,
            totalMarks: parseInt(findValue(row, 'TotalMarks')) || 100,
            passingMarks: parseInt(findValue(row, 'PassingMarks')) || 40,
            allowedAttempts: parseInt(findValue(row, 'AllowedAttempts')) || 0,
            negativeMarks: parseFloat(findValue(row, 'NegativeMarks')) || 0,
            createdBy: req.user._id,
            collegeName: req.user.collegeName,
            collegeId: req.user.collegeId,
            department: req.user.department,
            isApproved: false,
            isPublished: false,
        })).filter(q => q.title);

        if (quizzesData.length === 0) {
            return res.status(400).json({ message: 'No valid quizzes found in file. Ensure you have a Title column.' });
        }

        const createdQuizzes = await Quiz.insertMany(quizzesData);
        res.status(201).json({
            message: `${createdQuizzes.length} quizzes uploaded successfully`,
            count: createdQuizzes.length
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'File processing error', error: error.message });
    }
};

const getStudentDashboardStats = async (req, res) => {
    try {
        const userId = req.user._id;

        if (!req.user.collegeName && !req.user.collegeId) {
            return res.json({
                quizzesTaken: 0,
                averageScore: 0,
                completionRate: 0,
                recentActivity: []
            });
        }

        const query = { isActive: true };
        if (req.user.collegeId) query.collegeId = req.user.collegeId;
        else query.collegeName = req.user.collegeName;

        const totalQuizzes = await Quiz.countDocuments(query);

        // This requires 'Result' model which we haven't imported in this file yet if it's separate
        // Let's assume we need to fetch results. 
        // Best practice is to have this in resultController, but user asked for dashboard stats.
        // We will do a simple aggregation if Result model is available or fetch from User.

        // Let's use the Result model. We need to import it.
        const Result = require('../models/resultModel');

        const results = await Result.find({ user: userId }).sort({ createdAt: -1 });

        const quizzesTaken = results.length;
        const totalScore = results.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions) * 100, 0);
        const averageScore = quizzesTaken > 0 ? Math.round(totalScore / quizzesTaken) : 0;

        // Completion Rate (Quizzes Taken / Total Available Quizzes)
        const completionRate = totalQuizzes > 0 ? Math.round((quizzesTaken / totalQuizzes) * 100) : 0;

        const recentActivity = results.slice(0, 5).map(r => ({
            id: r._id,
            quizTitle: r.quiz?.title || 'Unknown Quiz', // Populate if needed
            score: r.score,
            date: r.createdAt
        }));

        res.json({
            quizzesTaken,
            averageScore,
            completionRate,
            recentActivity
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getStudentDashboardStats,
    getQuizzes, getPendingQuizzes, getMyQuizzes, approveQuiz, getQuizById, createQuiz, updateQuiz, deleteQuiz, bulkUploadQuizzes
};
