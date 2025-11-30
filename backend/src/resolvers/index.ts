import { authResolvers } from './authResolvers';
import { serviceResolvers } from './serviceResolvers';
import { bookingResolvers } from './bookingResolvers';
import { reviewResolvers } from './reviewResolvers';
import { categoryResolvers } from './categoryResolvers';

export const resolvers = {
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
