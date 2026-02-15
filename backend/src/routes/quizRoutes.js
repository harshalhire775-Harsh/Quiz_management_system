const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
    getQuizzes,
    getQuizById,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    bulkUploadQuizzes
} = require('../controllers/quizController');
const { protect, admin, instructorOrAdmin } = require('../middleware/authMiddleware');

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Routes MUST be ordered: specific before generic
router.get('/student-dashboard', protect, require('../controllers/quizController').getStudentDashboardStats);
router.route('/pending').get(protect, admin, require('../controllers/quizController').getPendingQuizzes);
router.route('/my-quizzes').get(protect, instructorOrAdmin, require('../controllers/quizController').getMyQuizzes);
router.route('/bulk-upload').post(protect, instructorOrAdmin, upload.single('file'), bulkUploadQuizzes);
router.route('/').get(protect, getQuizzes).post(protect, instructorOrAdmin, createQuiz);
router
    .route('/:id')
    .get(protect, getQuizById)
    .put(protect, instructorOrAdmin, updateQuiz)
    .delete(protect, instructorOrAdmin, deleteQuiz);

router.route('/:id/approve').put(protect, admin, require('../controllers/quizController').approveQuiz);

module.exports = router;
