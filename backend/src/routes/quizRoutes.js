const express = require('express');
const router = express.Router();
const {
    getQuizzes,
    getQuizById,
    createQuiz,
    updateQuiz,
    deleteQuiz,
} = require('../controllers/quizController');
const { protect, admin, instructorOrAdmin } = require('../middleware/authMiddleware');

// Routes MUST be ordered: specific before generic
router.route('/pending').get(protect, admin, require('../controllers/quizController').getPendingQuizzes);
router.route('/my-quizzes').get(protect, instructorOrAdmin, require('../controllers/quizController').getMyQuizzes);
router.route('/').get(getQuizzes).post(protect, instructorOrAdmin, createQuiz);
router
    .route('/:id')
    .get(getQuizById)
    .put(protect, instructorOrAdmin, updateQuiz)
    .delete(protect, instructorOrAdmin, deleteQuiz);

router.route('/:id/approve').put(protect, admin, require('../controllers/quizController').approveQuiz);

module.exports = router;
