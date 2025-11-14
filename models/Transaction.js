const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Transaction = sequelize.define('Transaction', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    transaction_id: { type: DataTypes.STRING(50), unique: true, allowNull: false },
    type: { type: DataTypes.ENUM('in', 'out'), allowNull: false },
    category: { 
      type: DataTypes.ENUM('Transport', 'Mobile Money', 'Utilities', 'Rewards', 'Transfer', 'Income', 'NFC Payment', 'Bank Transfer'), 
      allowNull: false 
    },
    label: { type: DataTypes.STRING(255), allowNull: false },
    amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    sender_id: { type: DataTypes.INTEGER, allowNull: true },
    receiver_id: { type: DataTypes.INTEGER, allowNull: true },
    sender_phone: { type: DataTypes.STRING(20), allowNull: true },
    receiver_phone: { type: DataTypes.STRING(20), allowNull: true },
    message: { type: DataTypes.TEXT, allowNull: true },
    status: { type: DataTypes.ENUM('pending', 'completed', 'failed', 'cancelled'), defaultValue: 'completed' },
    payment_method: { type: DataTypes.ENUM('BluePay', 'MOMO', 'Bank', 'NFC'), allowNull: false },
    bank_name: { type: DataTypes.STRING(50), allowNull: true },
    account_number: { type: DataTypes.STRING(50), allowNull: true },
    balance_before: { type: DataTypes.DECIMAL(15, 2), allowNull: true },
    balance_after: { type: DataTypes.DECIMAL(15, 2), allowNull: true },
    metadata: { type: DataTypes.JSON, allowNull: true }
  }, {
    tableName: 'transactions',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: (transaction) => {
        if (!transaction.transaction_id) {
          const timestamp = Date.now().toString(36).toUpperCase();
          const random = Math.random().toString(36).substring(2, 9).toUpperCase();
          transaction.transaction_id = `TXN-${timestamp}-${random}`;
        }
      }
    }
  });

  return Transaction;
};