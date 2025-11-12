const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const BankAccount = sequelize.define('BankAccount', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' }
    },
    bank_name: {
      type: DataTypes.ENUM('BK', 'Equity', 'IM', 'Cogebanque', 'Access'),
      allowNull: false
    },
    account_number: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    account_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    is_default: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'bank_accounts',
    timestamps: true,
    underscored: true
  });

  return BankAccount;
};