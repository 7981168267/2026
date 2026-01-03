const { Notification } = require('../models');
const { Op } = require('sequelize');

// Get user notifications
exports.getNotifications = async (req, res) => {
  try {
    const { read } = req.query;
    const whereClause = { userId: req.user.id };

    if (read !== undefined) {
      whereClause.read = read === 'true';
    }

    const notifications = await Notification.findAll({
      where: whereClause,
      include: [
        {
          model: require('../models/Task'),
          as: 'task',
          attributes: ['id', 'title', 'description'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOne({
      where: { id: parseInt(id), userId: req.user.id }
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.read = true;
    await notification.save();

    res.json(notification);
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.update(
      { read: true },
      { where: { userId: req.user.id, read: false } }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get unread count
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.count({
      where: { userId: req.user.id, read: false }
    });

    res.json({ count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
