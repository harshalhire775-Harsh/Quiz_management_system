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
const getQuizzes = async (req, res) => {
    const quizzes = await Quiz.find({ isActive: true, isPublished: true });
    res.json(quizzes);
};

// @desc    Get pending quizzes for HOD
const getPendingQuizzes = async (req, res) => {
    const quizzes = await Quiz.find({ isApproved: false }).populate('createdBy', 'name email');
    res.json(quizzes);
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
    const quiz = await Quiz.findById(req.params.id);
    if (quiz) {
        res.json(quiz);
    } else {
        res.status(404).json({ message: 'Quiz not found' });
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
        createdBy: req.user._id, isApproved: false, isPublished: false,
    });
    const createdQuiz = await quiz.save();
    res.status(201).json(createdQuiz);
};

const updateQuiz = async (req, res) => {
    const { title, description, category, targetYear, duration, scheduledDate, isActive, isPublished, totalMarks, passingMarks, allowedAttempts, negativeMarks } = req.body;
    const quiz = await Quiz.findById(req.params.id);
    if (quiz) {
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

const deleteQuiz = async (req, res) => {
    const quiz = await Quiz.findById(req.params.id);
    if (quiz) {
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

module.exports = {
    getQuizzes, getPendingQuizzes, getMyQuizzes, approveQuiz, getQuizById, createQuiz, updateQuiz, deleteQuiz, bulkUploadQuizzes
};
