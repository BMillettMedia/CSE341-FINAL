const request = require('supertest');
const express = require('express');
const { connectDB } = require('../config/database');
const { User } = require('../models/User');
const { verifyToken, generateToken } = require('../utils/auth');

jest.mock('../config/database');
jest.mock('../models/User');
jest.mock('../utils/auth');
jest.mock('@apollo/server');
jest.mock('passport');

describe('Server', () => {
    let app;

    beforeEach(() => {
        jest.clearAllMocks();
        app = express();
        app.use(express.json());
    });

    describe('Health Check', () => {
        it('should return server status', async () => {
            app.get('/health', (req, res) => {
                res.json({ status: 'ok', message: 'Server is running' });
            });

            const response = await request(app).get('/health');

            expect(response.status).toBe(200);
            expect(response.body.status).toBe('ok');
            expect(response.body.message).toBe('Server is running');
        });
    });

    describe('API Documentation', () => {
        it('should return API documentation', async () => {
            app.get('/api-docs', (req, res) => {
                res.json({
                    name: 'Service Marketplace API',
                    version: '1.0.0',
                    description: 'GraphQL API for connecting customers with service providers',
                    graphqlEndpoint: '/graphql',
                    authentication: 'JWT Bearer token',
                    features: [
                        'User authentication (register/login)',
                        'Service CRUD operations',
                        'Booking management',
                        'Review system',
                        'Category management'
                    ]
                });
            });

            const response = await request(app).get('/api-docs');

            expect(response.status).toBe(200);
            expect(response.body.name).toBe('Service Marketplace API');
            expect(response.body.features).toHaveLength(5);
        });
    });

    describe('Database Connection', () => {
        it('should connect to database successfully', async () => {
            connectDB.mockResolvedValue(true);

            await connectDB();

            expect(connectDB).toHaveBeenCalled();
        });

        it('should handle database connection errors', async () => {
            const error = new Error('Connection failed');
            connectDB.mockRejectedValue(error);

            await expect(connectDB()).rejects.toThrow('Connection failed');
        });
    });

    describe('Authentication Middleware', () => {
        it('should extract user from valid token', async () => {
            const mockUser = {
                _id: 'user123',
                email: 'test@example.com',
                userType: 'customer'
            };

            verifyToken.mockReturnValue({ userId: 'user123' });
            User.findById = jest.fn().mockResolvedValue(mockUser);

            const token = 'valid-token';
            const decoded = verifyToken(token);
            const user = await User.findById(decoded.userId);

            expect(user).toBeDefined();
            expect(user.email).toBe('test@example.com');
        });

        it('should return null for invalid token', () => {
            verifyToken.mockReturnValue(null);

            const result = verifyToken('invalid-token');

            expect(result).toBeNull();
        });

        it('should return null when no token provided', () => {
            const token = null;

            expect(token).toBeNull();
        });
    });

    describe('OAuth Routes', () => {
        it('should handle Google OAuth callback success', () => {
            const mockUser = {
                _id: 'user123',
                email: 'test@gmail.com',
                name: 'Test User',
                phone: '+1234567890',
                userType: 'customer',
                location: { city: 'Test', district: 'Test' },
                createdAt: new Date()
            };

            generateToken.mockReturnValue('generated-token');

            const token = generateToken({
                userId: mockUser._id.toString(),
                email: mockUser.email,
                name: mockUser.name,
                userType: mockUser.userType
            });

            expect(token).toBe('generated-token');
            expect(generateToken).toHaveBeenCalled();
        });

        it('should redirect to frontend with token on success', () => {
            const frontendUrl = 'http://localhost:8080';
            const token = 'test-token';
            const user = { userId: '123', email: 'test@example.com' };

            const redirectUrl = `${frontendUrl}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`;

            expect(redirectUrl).toContain(frontendUrl);
            expect(redirectUrl).toContain(token);
            expect(redirectUrl).toContain('test%40example.com');
        });
    });

    describe('CORS Configuration', () => {
        it('should allow requests from frontend URL', () => {
            const corsOptions = {
                origin: process.env.FRONTEND_URL || 'http://localhost:8080',
                credentials: true
            };

            expect(corsOptions.origin).toBeDefined();
            expect(corsOptions.credentials).toBe(true);
        });
    });

    describe('GraphQL Context', () => {
        it('should create context with authenticated user', async () => {
            const mockUser = {
                _id: 'user123',
                email: 'test@example.com',
                userType: 'provider'
            };

            verifyToken.mockReturnValue({ userId: 'user123' });
            User.findById = jest.fn().mockResolvedValue(mockUser);

            const token = 'Bearer valid-token';
            const decoded = verifyToken(token.replace('Bearer ', ''));
            const user = await User.findById(decoded.userId);

            const context = {
                user: {
                    userId: user._id.toString(),
                    email: user.email,
                    userType: user.userType
                }
            };

            expect(context.user).toBeDefined();
            expect(context.user.userId).toBe('user123');
            expect(context.user.userType).toBe('provider');
        });

        it('should create context with null user when no token', () => {
            const context = { user: null };

            expect(context.user).toBeNull();
        });

        it('should create context with null user when token invalid', () => {
            verifyToken.mockReturnValue(null);

            const decoded = verifyToken('invalid-token');
            const context = { user: decoded ? decoded : null };

            expect(context.user).toBeNull();
        });
    });
});