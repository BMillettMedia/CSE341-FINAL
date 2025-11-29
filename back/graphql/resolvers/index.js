// src/graphql/resolvers/index.js
const serviceResolvers = require('./serviceResolvers');

module.exports = {
  Query: {
    ...serviceResolvers.Query
  },
  Mutation: {
    ...serviceResolvers.Mutation
  }
};
