// backend/src/server.js
const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/database');
const { typeDefs } = require('./typeDefs');
const { resolvers } = require('./resolvers');
const { verifyToken } = require('./utils/auth');
const { User } = require('./models/User');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

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

  // GraphQL endpoint
  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req }) => {
        const token = req.headers.authorization?.replace('Bearer ', '');

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
        } catch {
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
