const express = require('express');
const router = express.Router();
const {
    submitResult,
    getMyResults,
    getAllResults,
    getQuizResults, // Added getQuizResults
} = require('../controllers/resultController');
const { getLeaderboard } = require('../controllers/leaderboardController');
const { protect, admin, instructorOrAdmin } = require('../middleware/authMiddleware'); // Added instructorOrAdmin

router.route('/').post(protect, submitResult).get(protect, admin, getAllResults); // Modified order
router.route('/myresults').get(protect, getMyResults); // Modified to .route()
router.route('/quiz/:quizId').get(protect, instructorOrAdmin, getQuizResults); // Added new route
router.get('/leaderboard', getLeaderboard);

module.exports = router;
