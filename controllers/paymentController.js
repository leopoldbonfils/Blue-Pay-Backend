const { User, Transaction, Notification, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.sendBluePay = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { phone, amount, message } = req.body;

    if (!phone || !amount || amount <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Phone number and valid amount are required'
      });
    }

    const sender = await User.findByPk(req.user.id, { transaction: t });

    if (parseFloat(sender.balance) < parseFloat(amount)) {
      await t.rollback();
      return res.status(400).json({
        status: 'error',
        message: 'Insufficient balance'
      });
    }

    const receiver = await User.findOne({ where: { phone }, transaction: t });

    if (!receiver) {
      await t.rollback();
      return res.status(404).json({
        status: 'error',
        message: 'Receiver not found'
      });
    }

    if (sender.id === receiver.id) {
      await t.rollback();
      return res.status(400).json({
        status: 'error',
        message: 'Cannot send money to yourself'
      });
    }

    const senderBalanceBefore = parseFloat(sender.balance);
    const receiverBalanceBefore = parseFloat(receiver.balance);

    await sender.update(
      { balance: senderBalanceBefore - parseFloat(amount) },
      { transaction: t }
    );

    await receiver.update(
      { balance: receiverBalanceBefore + parseFloat(amount) },
      { transaction: t }
    );

    const transaction = await Transaction.create({
      type: 'out',
      category: 'Transfer',
      label: `Sent to ${receiver.name}`,
      amount,
      sender_id: sender.id,
      receiver_id: receiver.id,
      sender_phone: sender.phone,
      receiver_phone: receiver.phone,
      message,
      status: 'completed',
      payment_method: 'BluePay',
      balance_before: senderBalanceBefore,
      balance_after: senderBalanceBefore - parseFloat(amount)
    }, { transaction: t });

    await Transaction.create({
      transaction_id: transaction.transaction_id + '-IN',
      type: 'in',
      category: 'Transfer',
      label: `Received from ${sender.name}`,
      amount,
      sender_id: sender.id,
      receiver_id: receiver.id,
      sender_phone: sender.phone,
      receiver_phone: receiver.phone,
      message,
      status: 'completed',
      payment_method: 'BluePay',
      balance_before: receiverBalanceBefore,
      balance_after: receiverBalanceBefore + parseFloat(amount)
    }, { transaction: t });

    await Notification.create({
      user_id: receiver.id,
      title: 'Payment Received',
      message: `You received ${amount} Rwf from ${sender.name}`,
      type: 'transaction',
      related_transaction_id: transaction.id
    }, { transaction: t });

    await t.commit();

    res.json({
      status: 'success',
      message: 'Payment sent successfully',
      data: { transaction }
    });
  } catch (error) {
    await t.rollback();
    console.error('BluePay error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};