// backend/src/resolver/authResolvers.ts
import { User } from '../models/User';
import { generateToken, hashPassword, comparePassword, validateEmail, validatePhone } from '../utils/auth';
import { GraphQLError } from 'graphql';

export const authResolvers = {
  Query: {
    me: async (_: any, __: any, context: any) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      const user = await User.findById(context.user.userId);
      if (!user) {
        throw new GraphQLError('User not found', {
          extensions: { code: 'NOT_FOUND' }
        });
      }

      return {
        userId: user._id.toString(),
        email: user.email,
        name: user.name,
        phone: user.phone,
        userType: user.userType,
        location: user.location,
        createdAt: user.createdAt.toISOString(),
        profileImage: user.profileImage,
        isVerified: user.isVerified
      };
    }
  },

  Mutation: {
    register: async (_: any, { input }: any) => {
      // Validation
      if (!validateEmail(input.email)) {
        throw new GraphQLError('Invalid email format', {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }

      if (!validatePhone(input.phone)) {
        throw new GraphQLError('Invalid phone number', {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }

      if (input.password.length < 6) {
        throw new GraphQLError('Password must be at least 6 characters', {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }

      if (!['customer', 'provider'].includes(input.userType)) {
        throw new GraphQLError('Invalid user type', {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }

      // Check if user exists
      const existingUser = await User.findOne({ email: input.email });
      if (existingUser) {
        throw new GraphQLError('User already exists', {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }

      // Hash password
      const hashedPassword = await hashPassword(input.password);

      // Create user
      const user = await User.create({
        email: input.email,
        password: hashedPassword,
        name: input.name,
        phone: input.phone,
        userType: input.userType,
        location: input.location
      });

      const userObj = {
        userId: user._id.toString(),
        email: user.email,
        name: user.name,
        phone: user.phone,
        userType: user.userType,
        location: user.location,
        createdAt: user.createdAt
      };

      const token = generateToken(userObj);

      return {
        token,
        user: {
          ...userObj,
          createdAt: user.createdAt.toISOString(),
          profileImage: user.profileImage,
          isVerified: user.isVerified
        }
      };
    },

    login: async (_: any, { input }: any) => {
      // Find user
      const user = await User.findOne({ email: input.email }).select('+password');
      if (!user) {
        throw new GraphQLError('Invalid credentials', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      // Check password
      if (!user.password) {
        throw new GraphQLError('Please use Google OAuth to login', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      const isValid = await comparePassword(input.password, user.password);
      if (!isValid) {
        throw new GraphQLError('Invalid credentials', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      const userObj = {
        userId: user._id.toString(),
        email: user.email,
        name: user.name,
        phone: user.phone,
        userType: user.userType,
        location: user.location,
        createdAt: user.createdAt
      };

      const token = generateToken(userObj);

      return {
        token,
        user: {
          ...userObj,
          createdAt: user.createdAt.toISOString(),
          profileImage: user.profileImage,
          isVerified: user.isVerified
        }
      };
    }
  }
};
