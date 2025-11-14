const express = require('express');
const router = express.Router();
const qrController = require('../controllers/qrController');
const { protect } = require('../middleware/auth');

router.use(protect);

// Generate QR code for receiving payments
router.post('/generate', qrController.generateQRCode);

// Validate scanned QR code
router.post('/validate', qrController.validateQRCode);

// Process QR payment
router.post('/process-payment', qrController.processQRPayment);

// Get QR payment history
router.get('/history', qrController.getQRPaymentHistory);

module.exports = router;