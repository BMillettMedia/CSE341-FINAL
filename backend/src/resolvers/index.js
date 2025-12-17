// backend/src/resolvers/index.js
const { authResolvers } = require('./authResolvers');
const { serviceResolvers } = require('./serviceResolvers');
const { bookingResolvers } = require('./bookingResolvers');
const { reviewResolvers } = require('./reviewResolvers');
const { categoryResolvers } = require('./categoryResolvers');

const resolvers = {
  Query: {
    ...authResolvers.Query,
    ...serviceResolvers.Query,
    ...bookingResolvers.Query,
    ...reviewResolvers.Query,
    ...categoryResolvers.Query
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...serviceResolvers.Mutation,
    ...bookingResolvers.Mutation,
    ...reviewResolvers.Mutation,
    ...categoryResolvers.Mutation
  },
  Service: serviceResolvers.Service,
  Booking: bookingResolvers.Booking,
  Review: reviewResolvers.Review
};

module.exports = { resolvers };
