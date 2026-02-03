const express = require('express');
const router = express.Router();
const {
    getQuestionsByQuiz,
    addQuestion,
    updateQuestion,
    deleteQuestion,
} = require('../controllers/questionController');
const { protect, admin, instructorOrAdmin } = require('../middleware/authMiddleware');

router.route('/').post(protect, instructorOrAdmin, addQuestion);
router.route('/quiz/:quizId').get(protect, getQuestionsByQuiz);
router
    .route('/:id')
    .put(protect, instructorOrAdmin, updateQuestion)
    .delete(protect, instructorOrAdmin, deleteQuestion);

module.exports = router;
