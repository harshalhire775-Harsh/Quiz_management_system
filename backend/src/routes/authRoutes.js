const express = require('express');
const router = express.Router();
const { authUser, registerUser, getUserProfile, updateUserProfile, getUsers, deleteUser, approveUser, resendCredentials, bulkRegister } = require('../controllers/authController');
const { protect, superAdmin, admin } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', authUser);
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);
router.route('/users').get(protect, admin, getUsers);
router.route('/users/:id').delete(protect, admin, deleteUser);

// router.put('/users/:id/approve', protect, admin, approveUser); // Moved to userRoutes
router.put('/users/:id/resend-credentials', protect, admin, resendCredentials);
router.post('/bulk-register', protect, admin, bulkRegister);

module.exports = router;
