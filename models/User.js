const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    phone: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    password: { type: DataTypes.STRING(255), allowNull: false },
    pin: { type: DataTypes.STRING(255), allowNull: false },
    profile_image: { type: DataTypes.TEXT, allowNull: true },
    balance: { type: DataTypes.DECIMAL(15, 2), defaultValue: 50000.00 },
    biometric_enabled: { type: DataTypes.BOOLEAN, defaultValue: false },
    notifications_enabled: { type: DataTypes.BOOLEAN, defaultValue: true },
    theme: { type: DataTypes.ENUM('light', 'dark'), defaultValue: 'light' },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    last_login: { type: DataTypes.DATE, allowNull: true },
    refresh_token: { type: DataTypes.TEXT, allowNull: true }
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) user.password = await bcrypt.hash(user.password, 10);
        if (user.pin) user.pin = await bcrypt.hash(user.pin, 10);
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) user.password = await bcrypt.hash(user.password, 10);
        if (user.changed('pin')) user.pin = await bcrypt.hash(user.pin, 10);
      }
    }
  });

  User.prototype.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  };

  User.prototype.comparePin = async function(candidatePin) {
    return await bcrypt.compare(candidatePin, this.pin);
  };

  User.prototype.toJSON = function() {
    const values = { ...this.get() };
    delete values.password;
    delete values.pin;
    delete values.refresh_token;
    return values;
  };

  User.addScope('withPassword', { attributes: { include: ['password'] } });
  User.addScope('withPin', { attributes: { include: ['pin'] } });

  return User;
};