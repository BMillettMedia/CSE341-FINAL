const { Service } = require('../../models/Service');

describe('Service Model', () => {
    it('should have required fields defined', () => {
        const serviceSchema = Service.schema.paths;

        expect(serviceSchema.providerId).toBeDefined();
        expect(serviceSchema.category).toBeDefined();
        expect(serviceSchema.description).toBeDefined();
        expect(serviceSchema.pricing).toBeDefined();
        expect(serviceSchema.location).toBeDefined();
    });

    it('should have pricing minimum value of 0', () => {
        const pricingMin = Service.schema.path('pricing').options.min;

        expect(pricingMin).toBe(0);
    });

    it('should have averageRating default to 0', () => {
        const avgRatingDefault = Service.schema.path('averageRating').defaultValue;

        expect(avgRatingDefault).toBe(0);
    });

    it('should have averageRating range 0-5', () => {
        const avgRatingPath = Service.schema.path('averageRating');

        expect(avgRatingPath.options.min).toBe(0);
        expect(avgRatingPath.options.max).toBe(5);
    });
});