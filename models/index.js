const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: dbConfig.pool,
    define: dbConfig.define
  }
);

const User = require('./User')(sequelize);
const Transaction = require('./Transaction')(sequelize);
const NFCPayment = require('./NFCPayment')(sequelize);
const BankAccount = require('./BankAccount')(sequelize);
const Notification = require('./Notification')(sequelize);

User.hasMany(Transaction, { as: 'sentTransactions', foreignKey: 'sender_id' });
User.hasMany(Transaction, { as: 'receivedTransactions', foreignKey: 'receiver_id' });
Transaction.belongsTo(User, { as: 'sender', foreignKey: 'sender_id' });
Transaction.belongsTo(User, { as: 'receiver', foreignKey: 'receiver_id' });

User.hasMany(NFCPayment, { as: 'merchantPayments', foreignKey: 'merchant_id' });
User.hasMany(NFCPayment, { as: 'customerPayments', foreignKey: 'customer_id' });
NFCPayment.belongsTo(User, { as: 'merchant', foreignKey: 'merchant_id' });
NFCPayment.belongsTo(User, { as: 'customer', foreignKey: 'customer_id' });
NFCPayment.belongsTo(Transaction, { foreignKey: 'transaction_id' });

User.hasMany(BankAccount, { foreignKey: 'user_id' });
BankAccount.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Notification, { foreignKey: 'user_id' });
Notification.belongsTo(User, { foreignKey: 'user_id' });
Notification.belongsTo(Transaction, { foreignKey: 'related_transaction_id' });

module.exports = {
  sequelize,
  User,
  Transaction,
  NFCPayment,
  BankAccount,
  Notification
};
