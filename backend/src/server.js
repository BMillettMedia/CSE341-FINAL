// backend/src/server.js
const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const cors = require('cors');
const dotenv = require('dotenv');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { connectDB } = require('./config/database');
const { typeDefs } = require('./typeDefs');
const { resolvers } = require('./resolvers');
const { verifyToken, generateToken } = require('./utils/auth');
const { User } = require('./models/User');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Configure Google OAuth Strategy
passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:4000/auth/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails && profile.emails[0] ? profile.emails[0].value : '';

            // Check by googleId first, then by email
            let user = await User.findOne({
                $or: [
                    { googleId: profile.id },
                    { email: email }
                ]
            });

            if (!user) {
                // Create new user
                user = await User.create({
                    googleId: profile.id,
                    email: email,
                    name: profile.displayName,
                    phone: 'Not provided',
                    userType: 'customer',
                    location: { city: 'Not provided', district: 'Not provided' },
                    isVerified: true
                });
            } else if (!user.googleId) {
                // Update existing user with googleId
                user.googleId = profile.id;
                user.isVerified = true;
                await user.save();
            }

            return done(null, user);
        } catch (error) {
            return done(error, undefined);
        }
    }
));

async function startServer() {
    // Connect to MongoDB
    await connectDB();

    // Create Apollo Server
    const server = new ApolloServer({
        typeDefs,
        resolvers,
    });

    await server.start();

    // Middleware
    app.use(cors({
        origin: process.env.FRONTEND_URL || 'http://localhost:8080',
        credentials: true
    }));
    app.use(express.json());
    app.use(passport.initialize());

    // OAuth routes
    app.get('/auth/google',
        passport.authenticate('google', { scope: ['profile', 'email'], session: false })
    );

    app.get('/auth/google/callback',
        passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login` }),
        (req, res) => {
            const user = req.user;
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

            console.log('callback redirect link', `${process.env.FRONTEND_URL}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(userObj))}`)

            // Redirect to frontend with token
            res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(userObj))}`);
        }
    );

    // GraphQL endpoint
    app.use(
        '/graphql',
        expressMiddleware(server, {
            context: async ({ req }) => {
                const token = req.headers.authorization ? req.headers.authorization.replace('Bearer ', '') : null;

                if (!token) return { user: null };

                try {
                    const decoded = verifyToken(token);
                    const user = await User.findById(decoded.userId);

                    return {
                        user: user ? {
                            userId: user._id.toString(),
                            email: user.email,
                            userType: user.userType
                        } : null
                    };
                } catch (error) {
                    return { user: null };
                }
            }
        })
    );

    // Health check endpoint
    app.get('/health', (req, res) => {
        res.json({ status: 'ok', message: 'Server is running' });
    });

    // API documentation route
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
            ],
            collections: [
                'Users (8 fields)',
                'Services (8 fields)',
                'Bookings (7 fields)',
                'Reviews (5 fields)',
                'Categories (4 fields)'
            ],
            documentation: 'Access GraphQL Playground at /graphql for interactive API exploration'
        });
    });

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(`GraphQL Playground: http://localhost:${PORT}/graphql`);
        console.log(`API Docs: http://localhost:${PORT}/api-docs`);
    });
}

startServer().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});