const { User, Transaction, Notification, sequelize } = require('../models');
const momoService = require('../services/momoService');
const bankService = require('../services/bankService');

exports.sendBluePay = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { phone, amount, message } = req.body;

    if (!phone || !amount || amount <= 0) {
      await t.rollback();
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
        message: 'Receiver not found. Make sure they have a BluePay account.'
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

    // Generate transaction ID
    const txnId = `TXN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    const transaction = await Transaction.create({
      transaction_id: txnId,
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
      transaction_id: txnId + '-IN',
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

exports.sendMobileMoney = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { phone, amount, message } = req.body;

    if (!phone || !amount || amount <= 0) {
      await t.rollback();
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

    const senderBalanceBefore = parseFloat(sender.balance);
    const txnId = `MOMO-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Initiate MOMO transfer
    const momoResult = await momoService.transfer(amount, phone, txnId, message || 'BluePay Transfer');

    if (!momoResult.success) {
      await t.rollback();
      return res.status(400).json({
        status: 'error',
        message: momoResult.error || 'Mobile money transfer failed'
      });
    }

    // Deduct from sender's balance
    await sender.update(
      { balance: senderBalanceBefore - parseFloat(amount) },
      { transaction: t }
    );

    // Create transaction record
    const transaction = await Transaction.create({
      transaction_id: txnId,
      type: 'out',
      category: 'Mobile Money',
      label: `Sent to ${phone}`,
      amount,
      sender_id: sender.id,
      sender_phone: sender.phone,
      receiver_phone: phone,
      message,
      status: 'completed',
      payment_method: 'Mobile Money',
      balance_before: senderBalanceBefore,
      balance_after: senderBalanceBefore - parseFloat(amount),
      external_reference: momoResult.referenceId
    }, { transaction: t });

    await t.commit();

    res.json({
      status: 'success',
      message: 'Mobile money transfer initiated successfully',
      data: { 
        transaction,
        referenceId: momoResult.referenceId
      }
    });
  } catch (error) {
    await t.rollback();
    console.error('Mobile money error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.sendBankTransfer = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { bank_name, account_number, amount, message } = req.body;

    if (!bank_name || !account_number || !amount || amount <= 0) {
      await t.rollback();
      return res.status(400).json({
        status: 'error',
        message: 'Bank name, account number, and valid amount are required'
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

    const senderBalanceBefore = parseFloat(sender.balance);
    const txnId = `BANK-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Verify bank account
    const verifyResult = await bankService.verifyAccount(bank_name, account_number);
    
    if (!verifyResult.success || !verifyResult.verified) {
      await t.rollback();
      return res.status(400).json({
        status: 'error',
        message: verifyResult.error || 'Bank account verification failed'
      });
    }

    // Initiate bank transfer
    const bankResult = await bankService.initiateTransfer(bank_name, account_number, amount, txnId);

    if (!bankResult.success) {
      await t.rollback();
      return res.status(400).json({
        status: 'error',
        message: bankResult.error || 'Bank transfer failed'
      });
    }

    // Deduct from sender's balance
    await sender.update(
      { balance: senderBalanceBefore - parseFloat(amount) },
      { transaction: t }
    );

    // Create transaction record
    const transaction = await Transaction.create({
      transaction_id: txnId,
      type: 'out',
      category: 'Bank Transfer',
      label: `Sent to ${bank_name} - ${account_number}`,
      amount,
      sender_id: sender.id,
      sender_phone: sender.phone,
      receiver_phone: account_number,
      message,
      status: bankResult.status === 'success' ? 'completed' : 'pending',
      payment_method: 'Bank Transfer',
      balance_before: senderBalanceBefore,
      balance_after: senderBalanceBefore - parseFloat(amount),
      external_reference: bankResult.transactionId,
      metadata: JSON.stringify({
        bank: bank_name,
        accountName: verifyResult.accountName
      })
    }, { transaction: t });

    await t.commit();

    res.json({
      status: 'success',
      message: 'Bank transfer initiated successfully',
      data: { 
        transaction,
        bankTransactionId: bankResult.transactionId,
        accountName: verifyResult.accountName
      }
    });
  } catch (error) {
    await t.rollback();
    console.error('Bank transfer error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};