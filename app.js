const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const nfcRoutes = require('./routes/nfcRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const qrRoutes = require('./routes/qrRoutes'); // ✅ Add this

const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'success', 
    message: 'BluePay API is running',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/nfc', nfcRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/qr', qrRoutes); // ✅ Add this line

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Error handler
app.use(errorHandler);

module.exports = app;