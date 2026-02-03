const express = require('express');
const router = express.Router();
const { submitContact, getMessages } = require('../controllers/contactController');
const { protect, superAdmin } = require('../middleware/authMiddleware');

router.post('/', protect, submitContact);
router.get('/', protect, getMessages); // Allow teachers/admins to view
router.delete('/:id', protect, require('../controllers/contactController').deleteMessage);

module.exports = router;
