const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const {
    getSystemStats,
    blockUser,
    unblockUser,
    getAllAdmins,
    createAdmin,
    bulkRegister // Import bulkRegister
} = require('../controllers/userController');
const { protect, superAdmin } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// Super Admin Routes
// router.get('/stats', superAdmin, getSystemStats); // Moved to shared admin stats
router.get('/admins', superAdmin, getAllAdmins);
router.post('/admins', superAdmin, createAdmin);

// Admin (HOD) & Super Admin Routes
// Note: 'admin' middleware checks for isAdmin OR Super Admin OR Admin (HOD)
const { admin } = require('../middleware/authMiddleware');

router.post('/bulk-register', admin, upload.single('file'), bulkRegister); // Bulk Register Route

router.get('/stats', admin, getSystemStats);
router.get('/dashboard-stats', admin, require('../controllers/userController').getDepartmentStats);

// @desc    Get student counts by year (FY, SY, TY)
router.get('/student-years', admin, require('../controllers/userController').getStudentYearStats);
router.get('/students-by-year', admin, require('../controllers/userController').getUsersByYear); // New route

router.get('/sirs', admin, require('../controllers/userController').getSirs);
router.post('/sirs', admin, require('../controllers/userController').createSir);

router.put('/:id/block', admin, blockUser);
router.put('/:id/unblock', admin, unblockUser);
router.delete('/:id', admin, require('../controllers/userController').deleteUser);
router.put('/:id/approve', admin, require('../controllers/authController').approveUser);
router.put('/:id/subject', admin, require('../controllers/userController').updateUserSubject);

module.exports = router;
