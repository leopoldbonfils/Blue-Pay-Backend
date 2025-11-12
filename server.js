require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 5000;

sequelize.authenticate()
  .then(() => {
    console.log('✅ MySQL Database Connected Successfully');
    console.log(`📦 Database: ${process.env.DB_NAME}`);
    console.log(`🏠 Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log('✅ Database Models Synchronized');
    
    const server = app.listen(PORT, () => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`🚀 BluePay Server Started`);
      console.log(`📍 Port: ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 API: http://localhost:${PORT}/api`);
      console.log(`❤️  Health Check: http://localhost:${PORT}/api/health`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    });

    process.on('SIGTERM', () => {
      console.log('👋 SIGTERM received. Closing server gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        sequelize.close();
        process.exit(0);
      });
    });
  })
  .catch(err => {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ Failed to start server');
    console.error('Error:', err.message);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    process.exit(1);
  });

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err.message);
  console.error(err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  console.error(err);
  process.exit(1);
});