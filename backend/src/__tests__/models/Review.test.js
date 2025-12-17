const { Review } = require('../../models/Review');

describe('Review Model', () => {
    it('should have required fields defined', () => {
        const reviewSchema = Review.schema.paths;

        expect(reviewSchema.bookingId).toBeDefined();
        expect(reviewSchema.customerId).toBeDefined();
        expect(reviewSchema.rating).toBeDefined();
        expect(reviewSchema.comment).toBeDefined();
    });

    it('should have rating range 1-5', () => {
        const ratingPath = Review.schema.path('rating');

        expect(ratingPath.options.min).toBe(1);
        expect(ratingPath.options.max).toBe(5);
    });

    it('should have createdAt with default value', () => {
        const createdAtDefault = Review.schema.path('createdAt').options.default;

        expect(createdAtDefault).toBeDefined();
    });
});