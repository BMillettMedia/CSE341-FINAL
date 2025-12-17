const { reviewResolvers } = require('../../resolvers/reviewResolvers');
const { Review } = require('../../models/Review');
const { Booking } = require('../../models/Booking');
const { Service } = require('../../models/Service');
//const { User } = require('../../models/User');

jest.mock('../../models/Review');
jest.mock('../../models/Booking');
jest.mock('../../models/Service');
jest.mock('../../models/User');

describe('Review Resolvers', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Query: reviews', () => {
        it('should return reviews for a service', async () => {
            const mockReviews = [
                {
                    _id: '1',
                    bookingId: 'booking123',
                    customerId: 'customer123',
                    rating: 5,
                    comment: 'Great service',
                    createdAt: new Date()
                }
            ];

            const mockBooking = {
                _id: 'booking123',
                serviceId: 'service123'
            };

            Review.find = jest.fn().mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockReviews)
            });
            Booking.findById = jest.fn().mockResolvedValue(mockBooking);

            const result = await reviewResolvers.Query.reviews(null, { serviceId: 'service123' });

            expect(result).toHaveLength(1);
            expect(result[0].rating).toBe(5);
        });
    });

    describe('Mutation: addReview', () => {
        it('should add review successfully', async () => {
            const input = {
                bookingId: 'booking123',
                customerId: 'customer123',
                rating: 5,
                comment: 'Excellent service'
            };

            const mockBooking = {
                _id: 'booking123',
                customerId: 'customer123',
                serviceId: 'service123',
                status: 'completed'
            };

            const mockReview = {
                _id: 'review123',
                ...input,
                createdAt: new Date()
            };

            Booking.findById = jest.fn().mockResolvedValue(mockBooking);
            Review.findOne = jest.fn().mockResolvedValue(null);
            Review.create = jest.fn().mockResolvedValue(mockReview);
            Service.findById = jest.fn().mockResolvedValue({ _id: 'service123' });
            Review.find = jest.fn().mockResolvedValue([mockReview]);
            Service.findByIdAndUpdate = jest.fn().mockResolvedValue({});

            const context = { user: { userId: 'customer123' } };

            const result = await reviewResolvers.Mutation.addReview(null, { input }, context);

            expect(result.reviewId).toBe('review123');
            expect(result.rating).toBe(5);
            expect(Review.create).toHaveBeenCalledWith(input);
        });

        it('should throw error when not authenticated', async () => {
            const input = { rating: 5 };
            const context = { user: null };

            await expect(
                reviewResolvers.Mutation.addReview(null, { input }, context)
            ).rejects.toThrow('Not authenticated');
        });

        it('should throw error for invalid rating', async () => {
            const input = {
                bookingId: 'booking123',
                customerId: 'customer123',
                rating: 6,
                comment: 'Test'
            };

            const context = { user: { userId: 'customer123' } };

            await expect(
                reviewResolvers.Mutation.addReview(null, { input }, context)
            ).rejects.toThrow('Rating must be between 1 and 5');
        });

        it('should throw error when booking not found', async () => {
            const input = {
                bookingId: 'invalid',
                customerId: 'customer123',
                rating: 5
            };

            Booking.findById = jest.fn().mockResolvedValue(null);
            const context = { user: { userId: 'customer123' } };

            await expect(
                reviewResolvers.Mutation.addReview(null, { input }, context)
            ).rejects.toThrow('Booking not found');
        });

        it('should throw error when booking not completed', async () => {
            const input = {
                bookingId: 'booking123',
                customerId: 'customer123',
                rating: 5
            };

            const mockBooking = {
                _id: 'booking123',
                status: 'pending'
            };

            Booking.findById = jest.fn().mockResolvedValue(mockBooking);
            const context = { user: { userId: 'customer123' } };

            await expect(
                reviewResolvers.Mutation.addReview(null, { input }, context)
            ).rejects.toThrow('Can only review completed bookings');
        });

        it('should throw error when not authorized', async () => {
            const input = {
                bookingId: 'booking123',
                customerId: 'customer123',
                rating: 5
            };

            const mockBooking = {
                _id: 'booking123',
                customerId: 'differentCustomer',
                status: 'completed'
            };

            Booking.findById = jest.fn().mockResolvedValue(mockBooking);
            const context = { user: { userId: 'customer123' } };

            await expect(
                reviewResolvers.Mutation.addReview(null, { input }, context)
            ).rejects.toThrow('Not authorized to review this booking');
        });

        it('should throw error when review already exists', async () => {
            const input = {
                bookingId: 'booking123',
                customerId: 'customer123',
                rating: 5
            };

            const mockBooking = {
                _id: 'booking123',
                customerId: 'customer123',
                status: 'completed'
            };

            Booking.findById = jest.fn().mockResolvedValue(mockBooking);
            Review.findOne = jest.fn().mockResolvedValue({ _id: 'existingReview' });
            const context = { user: { userId: 'customer123' } };

            await expect(
                reviewResolvers.Mutation.addReview(null, { input }, context)
            ).rejects.toThrow('Review already exists for this booking');
        });
    });
});