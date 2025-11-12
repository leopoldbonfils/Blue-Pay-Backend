const crypto = require('crypto');

class NFCService {
  constructor() {
    this.tokenExpiry = parseInt(process.env.NFC_TOKEN_EXPIRY) || 300000;
  }

  generateToken() {
    return crypto.randomBytes(16).toString('hex');
  }

  encryptPaymentData(data) {
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(process.env.NFC_ENCRYPTION_KEY, 'hex').slice(0, 32);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return {
      encrypted: encrypted,
      iv: iv.toString('hex')
    };
  }

  decryptPaymentData(encrypted, ivHex) {
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(process.env.NFC_ENCRYPTION_KEY, 'hex').slice(0, 32);
    const iv = Buffer.from(ivHex, 'hex');

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  }

  validateToken(token, expiresAt) {
    if (!token || !expiresAt) {
      return { valid: false, reason: 'Missing token or expiry' };
    }

    const now = new Date();
    const expiry = new Date(expiresAt);

    if (now > expiry) {
      return { valid: false, reason: 'Token expired' };
    }

    return { valid: true };
  }

  calculateExpiryTime() {
    return new Date(Date.now() + this.tokenExpiry);
  }

  generatePaymentRequest(merchantId, amount) {
    const token = this.generateToken();
    const expiresAt = this.calculateExpiryTime();

    return {
      token,
      merchantId,
      amount,
      expiresAt,
      createdAt: new Date()
    };
  }

  signPaymentData(data) {
    const hmac = crypto.createHmac('sha256', process.env.NFC_ENCRYPTION_KEY);
    hmac.update(JSON.stringify(data));
    return hmac.digest('hex');
  }

  verifyPaymentSignature(data, signature) {
    const expectedSignature = this.signPaymentData(data);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }
}

module.exports = new NFCService();