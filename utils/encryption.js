const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.NFC_ENCRYPTION_KEY || crypto.randomBytes(32);
const IV_LENGTH = 16;

exports.encrypt = (text) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    ALGORITHM, 
    Buffer.from(ENCRYPTION_KEY, 'hex').slice(0, 32), 
    iv
  );
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
};

exports.decrypt = (text) => {
  const parts = text.split(':');
  const iv = Buffer.from(parts.shift(), 'hex');
  const encryptedText = parts.join(':');
  
  const decipher = crypto.createDecipheriv(
    ALGORITHM, 
    Buffer.from(ENCRYPTION_KEY, 'hex').slice(0, 32), 
    iv
  );
  
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};

exports.hashData = (data) => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

exports.generateSecureToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

exports.generateHMAC = (data, secret) => {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
};

exports.verifyHMAC = (data, secret, signature) => {
  const expectedSignature = exports.generateHMAC(data, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
};

exports.encryptObject = (obj) => {
  const jsonString = JSON.stringify(obj);
  return exports.encrypt(jsonString);
};

exports.decryptObject = (encryptedString) => {
  const decryptedString = exports.decrypt(encryptedString);
  return JSON.parse(decryptedString);
};