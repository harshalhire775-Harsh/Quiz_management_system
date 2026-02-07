const Notification = require('../models/notificationModel');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .sort({ createdAt: -1 })
            .limit(20);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (notification) {
            notification.isRead = true;
            await notification.save();
            res.json(notification);
        } else {
            res.status(404).json({ message: 'Notification not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Internal helper to create notification
// Usage: const { createNotification } = require('../controllers/notificationController');
// await createNotification(userId, 'title', 'message', 'success');
const createNotification = async (recipientId, title, message, type = 'info') => {
    try {
        await Notification.create({
            recipient: recipientId,
            title,
            message,
            type
        });
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    createNotification
};
