const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
    getQuestionsByQuiz,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    bulkUploadQuestions
} = require('../controllers/questionController');
const { protect, instructorOrAdmin } = require('../middleware/authMiddleware');

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.route('/').post(protect, instructorOrAdmin, addQuestion);
router.route('/quiz/:quizId').get(protect, getQuestionsByQuiz);
router.route('/bulk-upload/:quizId').post(protect, instructorOrAdmin, upload.single('file'), bulkUploadQuestions);
router
    .route('/:id')
    .put(protect, instructorOrAdmin, updateQuestion)
    .delete(protect, instructorOrAdmin, deleteQuestion);

module.exports = router;
