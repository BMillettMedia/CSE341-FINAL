const { resolvers } = require('../../resolvers');
const { authResolvers } = require('../../resolvers/authResolvers');
const { serviceResolvers } = require('../../resolvers/serviceResolvers');
const { bookingResolvers } = require('../../resolvers/bookingResolvers');
const { reviewResolvers } = require('../../resolvers/reviewResolvers');
const { categoryResolvers } = require('../../resolvers/categoryResolvers');

describe('Resolver Index', () => {
    it('should export combined Query resolvers', () => {
        expect(resolvers.Query).toBeDefined();
        expect(resolvers.Query.me).toBe(authResolvers.Query.me);
        expect(resolvers.Query.services).toBe(serviceResolvers.Query.services);
        expect(resolvers.Query.bookings).toBe(bookingResolvers.Query.bookings);
        expect(resolvers.Query.reviews).toBe(reviewResolvers.Query.reviews);
        expect(resolvers.Query.categories).toBe(categoryResolvers.Query.categories);
    });

    it('should export combined Mutation resolvers', () => {
        expect(resolvers.Mutation).toBeDefined();
        expect(resolvers.Mutation.register).toBe(authResolvers.Mutation.register);
        expect(resolvers.Mutation.createService).toBe(serviceResolvers.Mutation.createService);
        expect(resolvers.Mutation.createBooking).toBe(bookingResolvers.Mutation.createBooking);
        expect(resolvers.Mutation.addReview).toBe(reviewResolvers.Mutation.addReview);
        expect(resolvers.Mutation.createCategory).toBe(categoryResolvers.Mutation.createCategory);
    });

    it('should export field resolvers', () => {
        expect(resolvers.Service).toBe(serviceResolvers.Service);
        expect(resolvers.Booking).toBe(bookingResolvers.Booking);
        expect(resolvers.Review).toBe(reviewResolvers.Review);
    });
});