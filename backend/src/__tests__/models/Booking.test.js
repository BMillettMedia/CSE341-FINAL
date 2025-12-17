const { Booking } = require('../../models/Booking');

describe('Booking Model', () => {
    it('should have required fields defined', () => {
        const bookingSchema = Booking.schema.paths;

        expect(bookingSchema.customerId).toBeDefined();
        expect(bookingSchema.serviceId).toBeDefined();
        expect(bookingSchema.date).toBeDefined();
        expect(bookingSchema.totalCost).toBeDefined();
        expect(bookingSchema.paymentMethod).toBeDefined();
    });

    it('should have correct status enum values', () => {
        const statusEnum = Booking.schema.path('status').enumValues;

        expect(statusEnum).toContain('pending');
        expect(statusEnum).toContain('confirmed');
        expect(statusEnum).toContain('completed');
        expect(statusEnum).toContain('cancelled');
    });

    it('should have correct payment method enum values', () => {
        const paymentEnum = Booking.schema.path('paymentMethod').enumValues;

        expect(paymentEnum).toContain('cash');
        expect(paymentEnum).toContain('orange');
        expect(paymentEnum).toContain('mtn');
        expect(paymentEnum).toContain('moov');
    });

    it('should have status default to pending', () => {
        const statusDefault = Booking.schema.path('status').defaultValue;

        expect(statusDefault).toBe('pending');
    });

    it('should have paymentStatus default to pending', () => {
        const paymentStatusDefault = Booking.schema.path('paymentStatus').defaultValue;

        expect(paymentStatusDefault).toBe('pending');
    });
});