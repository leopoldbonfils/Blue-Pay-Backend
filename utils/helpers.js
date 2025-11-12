exports.formatCurrency = (amount, currency = 'Rwf') => {
  const formatted = parseFloat(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return `${formatted} ${currency}`;
};

exports.generateTransactionId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 9).toUpperCase();
  return `TXN-${timestamp}-${random}`;
};

exports.generateOTP = (length = 6) => {
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
};

exports.maskPhoneNumber = (phone) => {
  if (!phone || phone.length < 4) return phone;
  const lastFour = phone.slice(-4);
  const masked = phone.slice(0, -4).replace(/\d/g, '*');
  return masked + lastFour;
};

exports.maskEmail = (email) => {
  if (!email || !email.includes('@')) return email;
  const [username, domain] = email.split('@');
  if (username.length <= 2) return email;
  const maskedUsername = username[0] + '*'.repeat(username.length - 2) + username.slice(-1);
  return `${maskedUsername}@${domain}`;
};

exports.calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return ((value / total) * 100).toFixed(2);
};

exports.getDateRange = (period) => {
  const now = new Date();
  let startDate, endDate;

  switch (period) {
    case 'today':
      startDate = new Date(now.setHours(0, 0, 0, 0));
      endDate = new Date(now.setHours(23, 59, 59, 999));
      break;
    case 'week':
      startDate = new Date(now.setDate(now.getDate() - 7));
      endDate = new Date();
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
      break;
    default:
      startDate = new Date(now.setDate(now.getDate() - 30));
      endDate = new Date();
  }

  return { startDate, endDate };
};

exports.formatDate = (date, format = 'full') => {
  const d = new Date(date);
  
  const options = {
    full: { 
      year: 'numeric', 
      month: 'short', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit' 
    },
    date: { 
      year: 'numeric', 
      month: 'short', 
      day: '2-digit' 
    },
    time: { 
      hour: '2-digit', 
      minute: '2-digit' 
    }
  };

  return d.toLocaleString('en-US', options[format]);
};

exports.isExpired = (expiryDate) => {
  return new Date() > new Date(expiryDate);
};

exports.getTimeRemaining = (expiryDate) => {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diff = expiry - now;

  if (diff <= 0) return { expired: true, seconds: 0 };

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  return {
    expired: false,
    seconds: seconds % 60,
    minutes: minutes % 60,
    hours,
    totalSeconds: seconds
  };
};

exports.generateReferenceNumber = (prefix = 'REF') => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${prefix}-${timestamp}-${random}`;
};

exports.chunkArray = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

exports.calculateFee = (amount, percentage = 1.5) => {
  return (parseFloat(amount) * percentage) / 100;
};

exports.roundToTwoDecimals = (number) => {
  return Math.round(number * 100) / 100;
};