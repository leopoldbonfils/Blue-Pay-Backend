const { Notification, Transaction, User } = require('../models');
const { Op } = require('sequelize');

exports.getAllNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, is_read, type } = req.query;
    const offset = (page - 1) * limit;

    const where = { user_id: req.user.id };

    if (typeof is_read !== 'undefined') {
      where.is_read = is_read === 'true';
    }

    if (type) {
      where.type = type;
    }

    const { count, rows: notifications } = await Notification.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: Transaction,
          attributes: ['id', 'transaction_id', 'amount', 'type', 'status']
        }
      ]
    });

    const unreadCount = await Notification.count({
      where: { user_id: req.user.id, is_read: false }
    });

    res.json({
      status: 'success',
      data: {
        notifications,
        unreadCount,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await Notification.count({
      where: { 
        user_id: req.user.id, 
        is_read: false 
      }
    });

    res.json({
      status: 'success',
      data: { unreadCount }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOne({
      where: { 
        id, 
        user_id: req.user.id 
      }
    });

    if (!notification) {
      return res.status(404).json({
        status: 'error',
        message: 'Notification not found'
      });
    }

    await notification.update({ is_read: true });

    res.json({
      status: 'success',
      message: 'Notification marked as read',
      data: { notification }
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.update(
      { is_read: true },
      { where: { user_id: req.user.id, is_read: false } }
    );

    res.json({
      status: 'success',
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOne({
      where: { 
        id, 
        user_id: req.user.id 
      }
    });

    if (!notification) {
      return res.status(404).json({
        status: 'error',
        message: 'Notification not found'
      });
    }

    await notification.destroy();

    res.json({
      status: 'success',
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
};

exports.deleteAllNotifications = async (req, res) => {
  try {
    await Notification.destroy({
      where: { user_id: req.user.id }
    });

    res.json({
      status: 'success',
      message: 'All notifications deleted successfully'
    });
  } catch (error) {
    console.error('Delete all notifications error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
};

exports.createNotification = async (req, res) => {
  try {
    const { title, message, type, related_transaction_id } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        status: 'error',
        message: 'Title and message are required'
      });
    }

    const notification = await Notification.create({
      user_id: req.user.id,
      title,
      message,
      type: type || 'system',
      related_transaction_id: related_transaction_id || null
    });

    res.status(201).json({
      status: 'success',
      message: 'Notification created',
      data: { notification }
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
};