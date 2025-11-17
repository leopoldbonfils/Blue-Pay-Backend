const { User, Transaction, NFCPayment, Notification, sequelize } = require('../models');
const { generateNFCToken } = require('../utils/tokenGenerator');
const crypto = require('crypto');

const encryptToken = (token) => {
  const cipher = crypto.createCipher('aes-256-cbc', process.env.NFC_ENCRYPTION_KEY);
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

const decryptToken = (encryptedToken) => {
  const decipher = crypto.createDecipher('aes-256-cbc', process.env.NFC_ENCRYPTION_KEY);
  let decrypted = decipher.update(encryptedToken, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

// RECEIVER creates payment request with amount and message
exports.createPaymentRequest = async (req, res) => {
  try {
    const { amount, message, device_info } = req.body; // NEW: Added message

    if (!amount || amount <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Valid amount is required'
      });
    }

    // Validate message length if provided
    if (message && message.length > 500) {
      return res.status(400).json({
        status: 'error',
        message: 'Message too long (max 500 characters)'
      });
    }

    const merchant = await User.findByPk(req.user.id);

    const paymentToken = generateNFCToken();
    const encryptedToken = encryptToken(paymentToken);

    const expiresAt = new Date(Date.now() + parseInt(process.env.NFC_TOKEN_EXPIRY || 300000));

    const nfcPayment = await NFCPayment.create({
      payment_token: encryptedToken,
      merchant_id: merchant.id,
      merchant_name: merchant.name,
      merchant_phone: merchant.phone,
      amount,
      message: message || null, // NEW: Store message
      status: 'pending',
      expires_at: expiresAt,
      device_info: device_info || {}
    });

    res.json({
      status: 'success',
      message: 'Payment request created',
      data: {
        payment_token: paymentToken,
        encrypted_token: encryptedToken,
        merchant: {
          id: merchant.id,
          name: merchant.name,
          phone: merchant.phone
        },
        amount: parseFloat(amount),
        message: message || null, // NEW: Return message
        expires_at: expiresAt,
        expires_in_seconds: Math.floor((expiresAt - Date.now()) / 1000)
      }
    });
  } catch (error) {
    console.error('Create payment request error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
};

// SENDER validates token and gets payment details including message
exports.validateToken = async (req, res) => {
  try {
    const { payment_token } = req.body;

    if (!payment_token) {
      return res.status(400).json({
        status: 'error',
        message: 'Payment token is required'
      });
    }

    const encryptedToken = encryptToken(payment_token);

    const nfcPayment = await NFCPayment.findOne({
      where: { payment_token: encryptedToken },
      include: [
        { 
          model: User, 
          as: 'merchant', 
          attributes: ['id', 'name', 'phone', 'profile_image'] 
        }
      ]
    });

    if (!nfcPayment) {
      return res.status(404).json({
        status: 'error',
        message: 'Invalid payment token'
      });
    }

    if (nfcPayment.status !== 'pending') {
      return res.status(400).json({
        status: 'error',
        message: `Payment already ${nfcPayment.status}`
      });
    }

    if (new Date() > new Date(nfcPayment.expires_at)) {
      await nfcPayment.update({ status: 'expired' });
      return res.status(400).json({
        status: 'error',
        message: 'Payment token has expired'
      });
    }

    const customer = await User.findByPk(req.user.id);

    if (customer.id === nfcPayment.merchant_id) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot pay yourself'
      });
    }

    if (parseFloat(customer.balance) < parseFloat(nfcPayment.amount)) {
      return res.status(400).json({
        status: 'error',
        message: 'Insufficient balance',
        data: {
          required: parseFloat(nfcPayment.amount),
          available: parseFloat(customer.balance),
          shortfall: parseFloat(nfcPayment.amount) - parseFloat(customer.balance)
        }
      });
    }

    res.json({
      status: 'success',
      message: 'Token validated successfully',
      data: {
        payment_id: nfcPayment.id,
        merchant: nfcPayment.merchant,
        amount: parseFloat(nfcPayment.amount),
        message: nfcPayment.message || null, // NEW: Return message
        customer_balance: parseFloat(customer.balance),
        expires_at: nfcPayment.expires_at
      }
    });
  } catch (error) {
    console.error('Validate token error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
};

// SENDER processes payment with PIN
exports.processPayment = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { payment_token, pin } = req.body;

    if (!payment_token || !pin) {
      await t.rollback();
      return res.status(400).json({
        status: 'error',
        message: 'Payment token and PIN are required'
      });
    }

    const encryptedToken = encryptToken(payment_token);

    const nfcPayment = await NFCPayment.findOne({
      where: { payment_token: encryptedToken },
      transaction: t
    });

    if (!nfcPayment) {
      await t.rollback();
      return res.status(404).json({
        status: 'error',
        message: 'Invalid payment token'
      });
    }

    if (nfcPayment.status !== 'pending') {
      await t.rollback();
      return res.status(400).json({
        status: 'error',
        message: `Payment already ${nfcPayment.status}`
      });
    }

    if (new Date() > new Date(nfcPayment.expires_at)) {
      await nfcPayment.update({ status: 'expired' }, { transaction: t });
      await t.rollback();
      return res.status(400).json({
        status: 'error',
        message: 'Payment token has expired'
      });
    }

    const customer = await User.findByPk(req.user.id, { transaction: t });
    const merchant = await User.findByPk(nfcPayment.merchant_id, { transaction: t });

    // Verify PIN
    const bcrypt = require('bcryptjs');
    const isPinValid = await bcrypt.compare(pin, customer.pin);
    
    if (!isPinValid) {
      await t.rollback();
      return res.status(401).json({
        status: 'error',
        message: 'Invalid PIN'
      });
    }

    const { amount } = nfcPayment;
    const customerBalanceBefore = parseFloat(customer.balance);
    const merchantBalanceBefore = parseFloat(merchant.balance);

    if (customerBalanceBefore < amount) {
      await t.rollback();
      return res.status(400).json({
        status: 'error',
        message: 'Insufficient balance'
      });
    }

    await customer.update(
      { balance: customerBalanceBefore - amount },
      { transaction: t }
    );

    await merchant.update(
      { balance: merchantBalanceBefore + amount },
      { transaction: t }
    );

    // Create transaction with message
    const transaction = await Transaction.create({
      type: 'out',
      category: 'NFC Payment',
      label: `NFC Payment to ${merchant.name}`,
      amount,
      sender_id: customer.id,
      receiver_id: merchant.id,
      sender_phone: customer.phone,
      receiver_phone: merchant.phone,
      status: 'completed',
      payment_method: 'NFC',
      message: nfcPayment.message, // NEW: Store message in transaction
      balance_before: customerBalanceBefore,
      balance_after: customerBalanceBefore - amount,
      metadata: {
        nfc_payment_id: nfcPayment.id,
        payment_token: encryptedToken
      }
    }, { transaction: t });

    // Create receiver transaction with message
    await Transaction.create({
      transaction_id: transaction.transaction_id + '-IN',
      type: 'in',
      category: 'NFC Payment',
      label: `NFC Payment from ${customer.name}`,
      amount,
      sender_id: customer.id,
      receiver_id: merchant.id,
      sender_phone: customer.phone,
      receiver_phone: merchant.phone,
      status: 'completed',
      payment_method: 'NFC',
      message: nfcPayment.message, // NEW: Store message in receiver transaction
      balance_before: merchantBalanceBefore,
      balance_after: merchantBalanceBefore + amount,
      metadata: {
        nfc_payment_id: nfcPayment.id,
        payment_token: encryptedToken
      }
    }, { transaction: t });

    await nfcPayment.update({
      customer_id: customer.id,
      transaction_id: transaction.id,
      status: 'completed',
      completed_at: new Date()
    }, { transaction: t });

    // Create notifications with message context
    const messageContext = nfcPayment.message ? ` - ${nfcPayment.message}` : '';
    
    await Notification.create({
      user_id: merchant.id,
      title: 'Money Received Successfully',
      message: `You received ${amount} Rwf from ${customer.name} via NFC${messageContext}`,
      type: 'payment',
      related_transaction_id: transaction.id
    }, { transaction: t });

    await Notification.create({
      user_id: customer.id,
      title: 'Payment Sent Successfully',
      message: `You paid ${amount} Rwf to ${merchant.name} via NFC${messageContext}`,
      type: 'payment',
      related_transaction_id: transaction.id
    }, { transaction: t });

    await t.commit();

    res.json({
      status: 'success',
      message: 'Payment completed successfully',
      data: {
        transaction: {
          transaction_id: transaction.transaction_id,
          amount: parseFloat(amount),
          message: nfcPayment.message, // NEW: Return message
          merchant: {
            name: merchant.name,
            phone: merchant.phone
          },
          customer: {
            name: customer.name,
            phone: customer.phone
          },
          completed_at: transaction.created_at,
          new_balance: customerBalanceBefore - amount
        }
      }
    });
  } catch (error) {
    await t.rollback();
    console.error('Process payment error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
};

// Get payment status (for polling)
exports.getPaymentStatus = async (req, res) => {
  try {
    const { token } = req.params;

    const encryptedToken = encryptToken(token);

    const nfcPayment = await NFCPayment.findOne({
      where: { payment_token: encryptedToken },
      include: [
        { 
          model: User, 
          as: 'merchant', 
          attributes: ['id', 'name', 'phone'] 
        },
        { 
          model: User, 
          as: 'customer', 
          attributes: ['id', 'name', 'phone'] 
        },
        {
          model: Transaction,
          attributes: ['transaction_id', 'amount', 'status', 'created_at', 'message'] // NEW: Include message
        }
      ]
    });

    if (!nfcPayment) {
      return res.status(404).json({
        status: 'error',
        message: 'Payment not found'
      });
    }

    const isExpired = new Date() > new Date(nfcPayment.expires_at);
    if (isExpired && nfcPayment.status === 'pending') {
      await nfcPayment.update({ status: 'expired' });
    }

    res.json({
      status: 'success',
      data: {
        payment: {
          id: nfcPayment.id,
          status: isExpired ? 'expired' : nfcPayment.status,
          amount: parseFloat(nfcPayment.amount),
          message: nfcPayment.message, // NEW: Return message
          merchant: nfcPayment.merchant,
          customer: nfcPayment.customer,
          transaction: nfcPayment.Transaction,
          expires_at: nfcPayment.expires_at,
          completed_at: nfcPayment.completed_at
        }
      }
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
};