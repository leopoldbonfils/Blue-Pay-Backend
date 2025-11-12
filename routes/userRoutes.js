const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/profile', userController.getProfile);
router.get('/balance', userController.getBalance);

module.exports = router;