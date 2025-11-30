import { Review } from '../models/Review';
import { Booking } from '../models/Booking';
import { Service } from '../models/Service';
import { User } from '../models/User';
import { GraphQLError } from 'graphql';

export const reviewResolvers = {
  Query: {
    reviews: async (_: any, { serviceId }: any) => {
      const reviews = await Review.find().populate('bookingId');
      
      // Filter reviews by service
      const serviceReviews = [];
      for (const review of reviews) {
        const booking = await Booking.findById(review.bookingId);
        if (booking && booking.serviceId === serviceId) {
          serviceReviews.push({
            reviewId: review._id.toString(),
            bookingId: review.bookingId,
            customerId: review.customerId,
            rating: review.rating,
            comment: review.comment,
            createdAt: review.createdAt.toISOString()
          });
        }
      }
      
      return serviceReviews;
    }
  },

  Mutation: {
    addReview: async (_: any, { input }: any, context: any) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      // Validate rating
      if (input.rating < 1 || input.rating > 5) {
        throw new GraphQLError('Rating must be between 1 and 5', {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }

      // Verify booking exists and is completed
      const booking = await Booking.findById(input.bookingId);
      if (!booking) {
        throw new GraphQLError('Booking not found', {
          extensions: { code: 'NOT_FOUND' }
        });
      }

      if (booking.status !== 'completed') {
        throw new GraphQLError('Can only review completed bookings', {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }

      if (booking.customerId !== input.customerId) {
        throw new GraphQLError('Not authorized to review this booking', {
          extensions: { code: 'FORBIDDEN' }
        });
      }

      // Check if review already exists
      const existingReview = await Review.findOne({ bookingId: input.bookingId });
      if (existingReview) {
        throw new GraphQLError('Review already exists for this booking', {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }

      const review = await Review.create(input);

      // Update service average rating
      const service = await Service.findById(booking.serviceId);
      if (service) {
        const allReviews = await Review.find();
        const serviceReviews = [];
        
        for (const r of allReviews) {
          const b = await Booking.findById(r.bookingId);
          if (b && b.serviceId === booking.serviceId) {
            serviceReviews.push(r);
          }
        }

        const avgRating = serviceReviews.reduce((sum, r) => sum + r.rating, 0) / serviceReviews.length;
        await Service.findByIdAndUpdate(booking.serviceId, { averageRating: avgRating });
      }

      return {
        reviewId: review._id.toString(),
        bookingId: review.bookingId,
        customerId: review.customerId,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt.toISOString()
      };
    }
  },

  Review: {
    customer: async (parent: any) => {
      const user = await User.findById(parent.customerId);
      
      if (!user) return null;

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
  }
};
