const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Notification = sequelize.define('Notification', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
    title: { type: DataTypes.STRING(255), allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    type: { type: DataTypes.ENUM('transaction', 'payment', 'security', 'system'), defaultValue: 'system' },
    is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
    related_transaction_id: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'transactions', key: 'id' } }
  }, {
    tableName: 'notifications',
    timestamps: true,
    underscored: true
  });

  return Notification;
};