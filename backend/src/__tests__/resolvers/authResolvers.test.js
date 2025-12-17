const { authResolvers } = require('../../resolvers/authResolvers');
const { User } = require('../../models/User');
const { generateToken, hashPassword, validateEmail, validatePhone } = require('../../utils/auth');

jest.mock('../../models/User');
jest.mock('../../utils/auth');

describe('Auth Resolvers', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Mock validation functions to return true by default
        validateEmail.mockReturnValue(true);
        validatePhone.mockReturnValue(true);
    });

    describe('Query: me', () => {
        it('should return current user when authenticated', async () => {
            const mockUser = {
                _id: '123',
                email: 'test@example.com',
                name: 'Test User',
                phone: '+1234567890',
                userType: 'customer',
                location: { city: 'Test City', district: 'Test District' },
                createdAt: new Date(),
                profileImage: null,
                isVerified: true
            };

            User.findById = jest.fn().mockResolvedValue(mockUser);

            const context = { user: { userId: '123' } };
            const result = await authResolvers.Query.me(null, {}, context);

            expect(result).toBeDefined();
            expect(result.email).toBe('test@example.com');
            expect(User.findById).toHaveBeenCalledWith('123');
        });

        it('should throw error when not authenticated', async () => {
            const context = { user: null };

            await expect(
                authResolvers.Query.me(null, {}, context)
            ).rejects.toThrow('Not authenticated');
        });

        it('should throw error when user not found', async () => {
            User.findById = jest.fn().mockResolvedValue(null);
            const context = { user: { userId: '123' } };

            await expect(
                authResolvers.Query.me(null, {}, context)
            ).rejects.toThrow('User not found');
        });
    });

    describe('Mutation: register', () => {
        it('should register new user successfully', async () => {
            const input = {
                email: 'new@example.com',
                password: 'password123',
                name: 'New User',
                phone: '+1234567890',
                userType: 'customer',
                location: { city: 'Test', district: 'Test' }
            };

            User.findOne = jest.fn().mockResolvedValue(null);
            hashPassword.mockResolvedValue('hashedPassword');
            User.create = jest.fn().mockResolvedValue({
                _id: '123',
                ...input,
                password: 'hashedPassword',
                createdAt: new Date(),
                profileImage: null,
                isVerified: false
            });
            generateToken.mockReturnValue('token123');

            const result = await authResolvers.Mutation.register(null, { input });

            expect(result.token).toBe('token123');
            expect(result.user.email).toBe('new@example.com');
            expect(User.findOne).toHaveBeenCalledWith({ email: 'new@example.com' });
            expect(User.create).toHaveBeenCalled();
        });

        it('should throw error for invalid email', async () => {
            const input = {
                email: 'invalid-email',
                password: 'password123',
                name: 'User',
                phone: '+1234567890',
                userType: 'customer',
                location: { city: 'Test', district: 'Test' }
            };

            validateEmail.mockReturnValue(false);

            await expect(
                authResolvers.Mutation.register(null, { input })
            ).rejects.toThrow('Invalid email format');
        });

        it('should throw error for invalid phone', async () => {
            const input = {
                email: 'test@example.com',
                password: 'password123',
                name: 'User',
                phone: 'invalid',
                userType: 'customer',
                location: { city: 'Test', district: 'Test' }
            };

            validatePhone.mockReturnValue(false);

            await expect(
                authResolvers.Mutation.register(null, { input })
            ).rejects.toThrow('Invalid phone number');
        });

        it('should throw error for short password', async () => {
            const input = {
                email: 'test@example.com',
                password: '123',
                name: 'User',
                phone: '+1234567890',
                userType: 'customer',
                location: { city: 'Test', district: 'Test' }
            };

            await expect(
                authResolvers.Mutation.register(null, { input })
            ).rejects.toThrow('Password must be at least 6 characters');
        });

        it('should throw error if user already exists', async () => {
            const input = {
                email: 'existing@example.com',
                password: 'password123',
                name: 'User',
                phone: '+1234567890',
                userType: 'customer',
                location: { city: 'Test', district: 'Test' }
            };

            User.findOne = jest.fn().mockResolvedValue({ email: 'existing@example.com' });

            await expect(
                authResolvers.Mutation.register(null, { input })
            ).rejects.toThrow('User already exists');
        });
    });

    describe('Mutation: login', () => {
        it('should login user successfully', async () => {
            const input = { email: 'test@example.com', password: 'password123' };
            const mockUser = {
                _id: '123',
                email: 'test@example.com',
                password: 'hashedPassword',
                name: 'Test User',
                phone: '+1234567890',
                userType: 'customer',
                location: { city: 'Test', district: 'Test' },
                createdAt: new Date(),
                profileImage: null,
                isVerified: true
            };

            User.findOne = jest.fn().mockReturnValue({
                select: jest.fn().mockResolvedValue(mockUser)
            });

            const { comparePassword } = require('../../utils/auth');
            comparePassword.mockResolvedValue(true);
            generateToken.mockReturnValue('token123');

            const result = await authResolvers.Mutation.login(null, { input });

            expect(result.token).toBe('token123');
            expect(result.user.email).toBe('test@example.com');
        });

        it('should throw error for non-existent user', async () => {
            const input = { email: 'nonexistent@example.com', password: 'password123' };

            User.findOne = jest.fn().mockReturnValue({
                select: jest.fn().mockResolvedValue(null)
            });

            await expect(
                authResolvers.Mutation.login(null, { input })
            ).rejects.toThrow('Invalid credentials');
        });

        it('should throw error for wrong password', async () => {
            const input = { email: 'test@example.com', password: 'wrongpassword' };
            const mockUser = {
                _id: '123',
                email: 'test@example.com',
                password: 'hashedPassword',
                name: 'Test User'
            };

            User.findOne = jest.fn().mockReturnValue({
                select: jest.fn().mockResolvedValue(mockUser)
            });

            const { comparePassword } = require('../../utils/auth');
            comparePassword.mockResolvedValue(false);

            await expect(
                authResolvers.Mutation.login(null, { input })
            ).rejects.toThrow('Invalid credentials');
        });
    });
});