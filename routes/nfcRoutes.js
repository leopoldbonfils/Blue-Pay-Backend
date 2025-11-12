const express = require('express');
const router = express.Router();
const nfcController = require('../controllers/nfcController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/create-payment-request', nfcController.createPaymentRequest);
router.post('/validate-token', nfcController.validateToken);
router.post('/process-payment', nfcController.processPayment);
router.post('/cancel-payment', nfcController.cancelPayment);
router.get('/status/:token', nfcController.getPaymentStatus);
router.get('/history', nfcController.getNFCHistory);

module.exports = router;