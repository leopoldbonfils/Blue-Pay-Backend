const { User } = require('../models');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    res.json({ status: 'success', data: { user } });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getBalance = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    res.json({ status: 'success', data: { balance: parseFloat(user.balance) } });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};