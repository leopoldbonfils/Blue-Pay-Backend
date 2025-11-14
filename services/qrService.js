const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

class QRService {
  constructor() {
    this.qrExpiry = parseInt(process.env.QR_TOKEN_EXPIRY) || 300000; // 5 minutes
  }

  generateQRToken() {
    return uuidv4();
  }

  encryptQRData(data) {
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(process.env.NFC_ENCRYPTION_KEY || crypto.randomBytes(32), 'hex').slice(0, 32);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return {
      encrypted: encrypted,
      iv: iv.toString('hex')
    };
  }

  decryptQRData(encrypted, ivHex) {
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(process.env.NFC_ENCRYPTION_KEY || crypto.randomBytes(32), 'hex').slice(0, 32);
    const iv = Buffer.from(ivHex, 'hex');

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  }

  calculateExpiryTime() {
    return new Date(Date.now() + this.qrExpiry);
  }

  isExpired(expiryDate) {
    return new Date() > new Date(expiryDate);
  }

  generatePaymentQR(userId, userName, userPhone, amount = null) {
    const qrToken = this.generateQRToken();
    const expiresAt = this.calculateExpiryTime();

    const qrData = {
      type: 'payment_request',
      qr_token: qrToken,
      receiver_id: userId,
      receiver_name: userName,
      receiver_phone: userPhone,
      amount: amount || null, // null means any amount
      timestamp: new Date().toISOString(),
      expires_at: expiresAt.toISOString()
    };

    return {
      qrToken,
      qrData,
      expiresAt
    };
  }

  validateQRData(qrData) {
    if (!qrData || typeof qrData !== 'object') {
      return { valid: false, reason: 'Invalid QR data format' };
    }

    if (qrData.type !== 'payment_request') {
      return { valid: false, reason: 'Invalid QR type' };
    }

    if (!qrData.qr_token || !qrData.receiver_id) {
      return { valid: false, reason: 'Missing required fields' };
    }

    if (qrData.expires_at && this.isExpired(qrData.expires_at)) {
      return { valid: false, reason: 'QR code has expired' };
    }

    return { valid: true };
  }

  signQRData(data) {
    const secret = process.env.NFC_ENCRYPTION_KEY || 'default-secret';
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(JSON.stringify(data));
    return hmac.digest('hex');
  }

  verifyQRSignature(data, signature) {
    const expectedSignature = this.signQRData(data);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }
}

module.exports = new QRService();