const { User, Transaction, Notification, sequelize } = require('../models');
const qrService = require('../services/qrService');

exports.generateQRCode = async (req, res) => {
  try {
    const { amount } = req.body; // Optional: specific amount or null for any amount

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const { qrToken, qrData, expiresAt } = qrService.generatePaymentQR(
      user.id,
      user.name,
      user.phone,
      amount
    );

    // Sign the QR data for security
    const signature = qrService.signQRData(qrData);

    res.json({
      status: 'success',
      message: 'QR code generated successfully',
      data: {
        qr_token: qrToken,
        qr_data: qrData,
        signature,
        expires_at: expiresAt,
        expires_in_seconds: Math.floor((expiresAt - Date.now()) / 1000)
      }
    });
  } catch (error) {
    console.error('Generate QR error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.validateQRCode = async (req, res) => {
  try {
    const { qr_data, signature } = req.body;

    if (!qr_data) {
      return res.status(400).json({
        status: 'error',
        message: 'QR data is required'
      });
    }

    // Validate QR data structure
    const validation = qrService.validateQRData(qr_data);
    if (!validation.valid) {
      return res.status(400).json({
        status: 'error',
        message: validation.reason
      });
    }

    // Verify signature if provided
    if (signature && !qrService.verifyQRSignature(qr_data, signature)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid QR signature'
      });
    }

    // Get receiver information
    const receiver = await User.findByPk(qr_data.receiver_id, {
      attributes: ['id', 'name', 'phone', 'profile_image']
    });

    if (!receiver) {
      return res.status(404).json({
        status: 'error',
        message: 'Receiver not found'
      });
    }

    // Get sender information
    const sender = await User.findByPk(req.user.id);

    if (sender.id === receiver.id) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot pay yourself'
      });
    }

    res.json({
      status: 'success',
      message: 'QR code validated successfully',
      data: {
        qr_token: qr_data.qr_token,
        receiver: {
          id: receiver.id,
          name: receiver.name,
          phone: receiver.phone,
          profile_image: receiver.profile_image
        },
        amount: qr_data.amount,
        sender_balance: parseFloat(sender.balance)
      }
    });
  } catch (error) {
    console.error('Validate QR error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.processQRPayment = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { qr_data, amount, pin, message } = req.body;

    if (!qr_data || !pin) {
      await t.rollback();
      return res.status(400).json({
        status: 'error',
        message: 'QR data and PIN are required'
      });
    }

    // Validate QR data
    const validation = qrService.validateQRData(qr_data);
    if (!validation.valid) {
      await t.rollback();
      return res.status(400).json({
        status: 'error',
        message: validation.reason
      });
    }

    // Get sender (payer)
    const sender = await User.scope('withPin').findByPk(req.user.id, { transaction: t });

    // Verify PIN
    const isPinValid = await sender.comparePin(pin);
    if (!isPinValid) {
      await t.rollback();
      return res.status(401).json({
        status: 'error',
        message: 'Invalid PIN'
      });
    }

    // Get receiver
    const receiver = await User.findByPk(qr_data.receiver_id, { transaction: t });

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
        message: 'Cannot pay yourself'
      });
    }

    // Determine final amount
    const finalAmount = parseFloat(amount || qr_data.amount);

    if (!finalAmount || finalAmount <= 0) {
      await t.rollback();
      return res.status(400).json({
        status: 'error',
        message: 'Invalid amount'
      });
    }

    // Check sender balance
    const senderBalanceBefore = parseFloat(sender.balance);
    if (senderBalanceBefore < finalAmount) {
      await t.rollback();
      return res.status(400).json({
        status: 'error',
        message: 'Insufficient balance'
      });
    }

    const receiverBalanceBefore = parseFloat(receiver.balance);

    // Update balances
    await sender.update(
      { balance: senderBalanceBefore - finalAmount },
      { transaction: t }
    );

    await receiver.update(
      { balance: receiverBalanceBefore + finalAmount },
      { transaction: t }
    );

    // Generate transaction ID
    const txnId = `QR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // ✅ FIXED: Changed category from 'QR Payment' to 'Transfer' to match database ENUM
    // Create sender transaction
    const transaction = await Transaction.create({
      transaction_id: txnId,
      type: 'out',
      category: 'Transfer',  // ✅ FIXED: Was 'QR Payment', now 'Transfer'
      label: `QR Payment to ${receiver.name}`,
      amount: finalAmount,
      sender_id: sender.id,
      receiver_id: receiver.id,
      sender_phone: sender.phone,
      receiver_phone: receiver.phone,
      message: message || null,
      status: 'completed',
      payment_method: 'BluePay',
      balance_before: senderBalanceBefore,
      balance_after: senderBalanceBefore - finalAmount,
      metadata: {
        qr_token: qr_data.qr_token,
        payment_type: 'qr_scan'
      }
    }, { transaction: t });

    // Create receiver transaction
    await Transaction.create({
      transaction_id: txnId + '-IN',
      type: 'in',
      category: 'Transfer',  // ✅ FIXED: Was 'QR Payment', now 'Transfer'
      label: `QR Payment from ${sender.name}`,
      amount: finalAmount,
      sender_id: sender.id,
      receiver_id: receiver.id,
      sender_phone: sender.phone,
      receiver_phone: receiver.phone,
      message: message || null,
      status: 'completed',
      payment_method: 'BluePay',
      balance_before: receiverBalanceBefore,
      balance_after: receiverBalanceBefore + finalAmount,
      metadata: {
        qr_token: qr_data.qr_token,
        payment_type: 'qr_scan'
      }
    }, { transaction: t });

    // Create notifications
    await Notification.create({
      user_id: receiver.id,
      title: 'QR Payment Received',
      message: `You received ${finalAmount} Rwf from ${sender.name} via QR code`,
      type: 'payment',
      related_transaction_id: transaction.id
    }, { transaction: t });

    await Notification.create({
      user_id: sender.id,
      title: 'QR Payment Successful',
      message: `You paid ${finalAmount} Rwf to ${receiver.name} via QR code`,
      type: 'payment',
      related_transaction_id: transaction.id
    }, { transaction: t });

    await t.commit();

    res.json({
      status: 'success',
      message: 'Payment processed successfully',
      data: {
        transaction: {
          id: transaction.id,
          transaction_id: transaction.transaction_id,
          amount: transaction.amount,
          receiver: {
            name: receiver.name,
            phone: receiver.phone
          },
          status: transaction.status,
          created_at: transaction.created_at
        },
        new_balance: senderBalanceBefore - finalAmount
      }
    });
  } catch (error) {
    await t.rollback();
    console.error('Process QR payment error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.getQRPaymentHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: transactions } = await Transaction.findAndCountAll({
      where: {
        [sequelize.Op.or]: [
          { sender_id: req.user.id },
          { receiver_id: req.user.id }
        ],
        metadata: {
          payment_type: 'qr_scan'
        }
      },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'phone', 'profile_image']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'name', 'phone', 'profile_image']
        }
      ]
    });

    res.json({
      status: 'success',
      data: {
        transactions,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          total_pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get QR history error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};