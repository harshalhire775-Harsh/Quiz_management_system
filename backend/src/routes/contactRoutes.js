const express = require('express');
const router = express.Router();
const { submitContact, getMessages } = require('../controllers/contactController');
const { protect, superAdmin } = require('../middleware/authMiddleware');

router.post('/', submitContact);
router.get('/', protect, getMessages); // Allow teachers/admins to view
router.delete('/:id', protect, require('../controllers/contactController').deleteMessage);
router.put('/:id/read', protect, require('../controllers/contactController').markAsRead);

module.exports = router;
