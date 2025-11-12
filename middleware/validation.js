const { body, param, query, validationResult } = require('express-validator');
const validators = require('../utils/validators');

exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

exports.registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2-100 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone is required')
    .custom(validators.validatePhone).withMessage('Invalid Rwandan phone number (+250XXXXXXXXX)'),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  
  body('pin')
    .notEmpty().withMessage('PIN is required')
    .custom(validators.validatePin).withMessage('PIN must be 4-6 digits'),
  
  exports.validate
];

exports.loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format'),
  
  body('password')
    .notEmpty().withMessage('Password is required'),
  
  exports.validate
];

exports.paymentValidation = [
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .custom(validators.validateAmount).withMessage('Invalid amount'),
  
  body('phone')
    .optional()
    .custom(validators.validatePhone).withMessage('Invalid phone number'),
  
  exports.validate
];

exports.nfcPaymentValidation = [
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .custom(validators.validateAmount).withMessage('Invalid amount'),
  
  exports.validate
];

exports.bankTransferValidation = [
  body('bank_name')
    .notEmpty().withMessage('Bank name is required')
    .custom(validators.validateBankName).withMessage('Invalid bank name'),
  
  body('account_number')
    .notEmpty().withMessage('Account number is required')
    .custom(validators.validateAccountNumber).withMessage('Invalid account number'),
  
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .custom(validators.validateAmount).withMessage('Invalid amount'),
  
  exports.validate
];

exports.changePasswordValidation = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),
  
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  
  exports.validate
];

exports.changePinValidation = [
  body('currentPin')
    .notEmpty().withMessage('Current PIN is required')
    .custom(validators.validatePin).withMessage('Invalid PIN format'),
  
  body('newPin')
    .notEmpty().withMessage('New PIN is required')
    .custom(validators.validatePin).withMessage('New PIN must be 4-6 digits'),
  
  exports.validate
];

exports.idParamValidation = [
  param('id')
    .notEmpty().withMessage('ID is required')
    .isInt({ min: 1 }).withMessage('Invalid ID'),
  
  exports.validate
];