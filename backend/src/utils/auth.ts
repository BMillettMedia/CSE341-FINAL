import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { IUser } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'd7ee794797e12cca5e5f23b6dd91a4066f436a62813b5aac4f280d86cfdd8479';

export const generateToken = (user: IUser): string => {
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

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s-]{8,}$/;
  return phoneRegex.test(phone);
};
