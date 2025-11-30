// backend/src/server.ts
import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import { typeDefs } from './typeDefs';
import { resolvers } from './resolvers';
import { verifyToken } from './utils/auth';
import { User } from './models/User';

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

  // Auth middleware for GraphQL context
  const authMiddleware = async (req: any) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return { user: null };
    }

    const decoded = verifyToken(token);
    
    if (!decoded) {
      return { user: null };
    }

    const user = await User.findById(decoded.userId);
    
    return { 
      user: user ? {
        userId: user._id.toString(),
        email: user.email,
        userType: user.userType
      } : null 
    };
  };

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
