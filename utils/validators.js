const validator = require('validator');

exports.validateEmail = (email) => {
  return validator.isEmail(email);
};

exports.validatePhone = (phone) => {
  const rwandaPhoneRegex = /^\+250\d{9}$/;
  return rwandaPhoneRegex.test(phone);
};

exports.validatePassword = (password) => {
  return password && password.length >= 6;
};

exports.validatePin = (pin) => {
  const pinRegex = /^\d{4,6}$/;
  return pinRegex.test(pin);
};

exports.validateAmount = (amount) => {
  const parsedAmount = parseFloat(amount);
  return !isNaN(parsedAmount) && parsedAmount > 0;
};

exports.validateBankName = (bankName) => {
  const validBanks = ['BK', 'Equity', 'IM', 'Cogebanque', 'Access'];
  return validBanks.includes(bankName);
};

exports.sanitizeString = (str) => {
  if (!str) return '';
  return validator.escape(validator.trim(str));
};

exports.isValidTransactionType = (type) => {
  return ['in', 'out'].includes(type);
};

exports.isValidCategory = (category) => {
  const validCategories = [
    'Transport', 'Mobile Money', 'Utilities', 
    'Rewards', 'Transfer', 'Income', 
    'NFC Payment', 'Bank Transfer'
  ];
  return validCategories.includes(category);
};

exports.isValidPaymentMethod = (method) => {
  return ['BluePay', 'MOMO', 'Bank', 'NFC'].includes(method);
};

exports.validateAccountNumber = (accountNumber) => {
  return accountNumber && accountNumber.length >= 10 && accountNumber.length <= 20;
}