const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', transactionController.getAllTransactions);

module.exports = router;