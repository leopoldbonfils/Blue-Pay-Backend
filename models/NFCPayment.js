const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const NFCPayment = sequelize.define('NFCPayment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    payment_token: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: false
    },
    merchant_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' }
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'users', key: 'id' }
    },
    merchant_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    merchant_phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'expired', 'failed'),
      defaultValue: 'pending'
    },
    transaction_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'transactions', key: 'id' }
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    device_info: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    tableName: 'nfc_payments',
    timestamps: true,
    underscored: true
  });

  return NFCPayment;
};