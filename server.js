// src/server.js
const express = require('express');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();
require('./auth/googleStrategy'); // this registers strategy
const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');
const connectDB = require('./config/db');

async function start() {
  const app = express();

  app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // set true in production with HTTPS
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  // quick auth endpoints to start flow
  app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
  app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => res.redirect('/'));

  app.get('/auth/logout', (req, res) => {
    req.logout(() => res.redirect('/'));
  });

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({ user: req.user })
  });

  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  await connectDB(process.env.MONGODB_URI);

  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`Server ready at http://localhost:${port}${server.graphqlPath}`);
  });
}

module.exports = start;
