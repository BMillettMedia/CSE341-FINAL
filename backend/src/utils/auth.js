// backend/src/utils/auth.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'd7ee794797e12cca5e5f23b6dd91a4066f436a62813b5aac4f280d86cfdd8479';

const generateToken = (user) => {
  return jwt.sign(
    { 
      userId: user.userId, 
      email: user.email,
      userType: user.userType 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

const hashPassword = async (password) => {
  return bcrypt.hash(password, 10);
};

const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  const phoneRegex = /^\+?[\d\s-]{8,}$/;
  return phoneRegex.test(phone);
};

module.exports = {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
  validateEmail,
  validatePhone
};
