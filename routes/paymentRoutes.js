const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/bluepay', paymentController.sendBluePay);
router.post('/mobile-money', paymentController.sendMobileMoney);
router.post('/bank-transfer', paymentController.sendBankTransfer);

module.exports = router;