const { User } = require('../models');
const { generateAccessToken, generateRefreshToken } = require('../utils/tokenGenerator');

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, pin } = req.body;

    if (!name || !email || !phone || !password || !pin) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'All fields are required' 
      });
    }

    const existingUser = await User.findOne({ 
      where: { 
        [require('sequelize').Op.or]: [{ email }, { phone }] 
      } 
    });

    if (existingUser) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Email or phone already exists' 
      });
    }

    const user = await User.create({ name, email, phone, password, pin });

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    await user.update({ refresh_token: refreshToken });

    res.status(201).json({
      status: 'success',
      message: 'Registration successful',
      data: { user: user.toJSON(), accessToken, refreshToken }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Email and password are required' 
      });
    }

    const user = await User.scope('withPassword').findOne({ where: { email } });

    if (!user || !user.is_active) {
      return res.status(401).json({ 
        status: 'error', 
        message: 'Invalid credentials' 
      });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        status: 'error', 
        message: 'Invalid credentials' 
      });
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    await user.update({ refresh_token: refreshToken, last_login: new Date() });

    res.json({
      status: 'success',
      message: 'Login successful',
      data: { user: user.toJSON(), accessToken, refreshToken }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};