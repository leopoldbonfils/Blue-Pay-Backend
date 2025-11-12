const { Transaction, User } = require('../models');
const { Op } = require('sequelize');

exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      where: {
        [Op.or]: [
          { sender_id: req.user.id },
          { receiver_id: req.user.id }
        ]
      },
      order: [['created_at', 'DESC']],
      limit: 20,
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'phone'] },
        { model: User, as: 'receiver', attributes: ['id', 'name', 'phone'] }
      ]
    });

    res.json({ status: 'success', data: { transactions } });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};