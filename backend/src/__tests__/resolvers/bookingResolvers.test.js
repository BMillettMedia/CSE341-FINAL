const { bookingResolvers } = require('../../resolvers/bookingResolvers');
const { Booking } = require('../../models/Booking');
const { Service } = require('../../models/Service');
const { User } = require('../../models/User');

jest.mock('../../models/Booking');
jest.mock('../../models/Service');
jest.mock('../../models/User');

describe('Booking Resolvers', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Query: bookings', () => {
        it('should return user bookings when authenticated', async () => {
            const mockBookings = [
                {
                    _id: '1',
                    customerId: 'user123',
                    serviceId: 'service123',
                    date: new Date(),
                    status: 'pending',
                    totalCost: 100,
                    paymentMethod: 'cash'
                }
            ];

            Booking.find = jest.fn().mockResolvedValue(mockBookings);
            const context = { user: { userId: 'user123' } };

            const result = await bookingResolvers.Query.bookings(null, { userId: 'user123' }, context);

            expect(result).toHaveLength(1);
            expect(result[0].customerId).toBe('user123');
            expect(Booking.find).toHaveBeenCalledWith({ customerId: 'user123' });
        });

        it('should throw error when not authenticated', async () => {
            const context = { user: null };

            await expect(
                bookingResolvers.Query.bookings(null, { userId: 'user123' }, context)
            ).rejects.toThrow('Not authenticated');
        });
    });

    describe('Query: booking', () => {
        it('should return single booking', async () => {
            const mockBooking = {
                _id: '1',
                customerId: 'user123',
                serviceId: 'service123',
                date: new Date(),
                status: 'confirmed',
                totalCost: 150,
                paymentMethod: 'orange'
            };

            Booking.findById = jest.fn().mockResolvedValue(mockBooking);
            const context = { user: { userId: 'user123' } };

            const result = await bookingResolvers.Query.booking(null, { id: '1' }, context);

            expect(result.bookingId).toBe('1');
            expect(result.status).toBe('confirmed');
        });

        it('should throw error when booking not found', async () => {
            Booking.findById = jest.fn().mockResolvedValue(null);
            const context = { user: { userId: 'user123' } };

            await expect(
                bookingResolvers.Query.booking(null, { id: 'invalid' }, context)
            ).rejects.toThrow('Booking not found');
        });
    });

    describe('Mutation: createBooking', () => {
        it('should create booking successfully', async () => {
            const input = {
                customerId: 'user123',
                serviceId: 'service123',
                date: new Date().toISOString(),
                paymentMethod: 'cash'
            };

            const mockService = {
                _id: 'service123',
                pricing: 200
            };

            const mockBooking = {
                _id: 'booking123',
                ...input,
                totalCost: 200,
                status: 'pending',
                date: new Date(input.date)
            };

            Service.findById = jest.fn().mockResolvedValue(mockService);
            Booking.create = jest.fn().mockResolvedValue(mockBooking);
            const context = { user: { userId: 'user123' } };

            const result = await bookingResolvers.Mutation.createBooking(null, { input }, context);

            expect(result.bookingId).toBe('booking123');
            expect(result.totalCost).toBe(200);
            expect(Service.findById).toHaveBeenCalledWith('service123');
        });

        it('should throw error for invalid payment method', async () => {
            const input = {
                customerId: 'user123',
                serviceId: 'service123',
                date: new Date().toISOString(),
                paymentMethod: 'invalid'
            };

            Service.findById = jest.fn().mockResolvedValue({ _id: 'service123' });
            const context = { user: { userId: 'user123' } };

            await expect(
                bookingResolvers.Mutation.createBooking(null, { input }, context)
            ).rejects.toThrow('Invalid payment method');
        });
    });

    describe('Mutation: updateBookingStatus', () => {
        it('should update booking status', async () => {
            const mockBooking = {
                _id: '1',
                customerId: 'user123',
                status: 'pending'
            };

            const updatedBooking = {
                ...mockBooking,
                status: 'confirmed',
                date: new Date(),
                totalCost: 100,
                paymentMethod: 'cash',
                serviceId: 'service123'
            };

            Booking.findById = jest.fn().mockResolvedValue(mockBooking);
            Booking.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedBooking);
            const context = { user: { userId: 'user123' } };

            const result = await bookingResolvers.Mutation.updateBookingStatus(
                null,
                { id: '1', status: 'confirmed' },
                context
            );

            expect(result.status).toBe('confirmed');
            expect(Booking.findByIdAndUpdate).toHaveBeenCalledWith('1', { status: 'confirmed' }, { new: true });
        });

        it('should throw error for invalid status', async () => {
            const context = { user: { userId: 'user123' } };

            await expect(
                bookingResolvers.Mutation.updateBookingStatus(null, { id: '1', status: 'invalid' }, context)
            ).rejects.toThrow('Invalid status');
        });
    });

    describe('Mutation: deleteBooking', () => {
        it('should delete booking successfully', async () => {
            const mockBooking = {
                _id: '1',
                customerId: 'user123'
            };

            Booking.findById = jest.fn().mockResolvedValue(mockBooking);
            Booking.findByIdAndDelete = jest.fn().mockResolvedValue(mockBooking);
            const context = { user: { userId: 'user123', userType: 'customer' } };

            const result = await bookingResolvers.Mutation.deleteBooking(null, { id: '1' }, context);

            expect(result).toBe(true);
            expect(Booking.findByIdAndDelete).toHaveBeenCalledWith('1');
        });

        it('should throw error when not authorized', async () => {
            const mockBooking = {
                _id: '1',
                customerId: 'differentUser'
            };

            Booking.findById = jest.fn().mockResolvedValue(mockBooking);
            const context = { user: { userId: 'user123', userType: 'customer' } };

            await expect(
                bookingResolvers.Mutation.deleteBooking(null, { id: '1' }, context)
            ).rejects.toThrow('Not authorized');
        });
    });

    describe('Query: bookingsByProvider', () => {
        it('should return bookings for provider services', async () => {
            const mockServices = [
                { _id: 'service1' },
                { _id: 'service2' }
            ];

            const mockBookings = [
                {
                    _id: 'booking1',
                    customerId: 'customer1',
                    serviceId: 'service1',
                    date: new Date(),
                    status: 'confirmed',
                    totalCost: 100,
                    paymentMethod: 'cash'
                }
            ];

            Service.find = jest.fn().mockResolvedValue(mockServices);
            Booking.find = jest.fn().mockResolvedValue(mockBookings);

            const result = await bookingResolvers.Query.bookingsByProvider(null, { providerId: 'provider123' });

            expect(result).toHaveLength(1);
            expect(Service.find).toHaveBeenCalledWith({ providerId: 'provider123' });
        });
    });

    describe('Mutation: markPaymentPaid', () => {
        it('should mark payment as paid', async () => {
            const mockBooking = {
                _id: 'booking123',
                customerId: 'customer123',
                serviceId: 'service123',
                date: new Date(),
                status: 'confirmed',
                totalCost: 100,
                paymentMethod: 'orange',
                paymentStatus: 'paid',
                paymentDate: new Date()
            };

            Booking.findByIdAndUpdate = jest.fn().mockResolvedValue(mockBooking);
            const context = { user: { userId: 'user123' } };

            const result = await bookingResolvers.Mutation.markPaymentPaid(
                null,
                { bookingId: 'booking123' },
                context
            );

            expect(result.paymentStatus).toBe('paid');
            expect(result.paymentDate).toBeDefined();
        });

        it('should throw error when booking not found', async () => {
            Booking.findByIdAndUpdate = jest.fn().mockResolvedValue(null);
            const context = { user: { userId: 'user123' } };

            await expect(
                bookingResolvers.Mutation.markPaymentPaid(null, { bookingId: 'invalid' }, context)
            ).rejects.toThrow('Booking not found');
        });
    });

    describe('Booking field resolvers', () => {
        it('should resolve customer field', async () => {
            const parent = { customerId: 'customer123' };
            const mockUser = {
                _id: 'customer123',
                email: 'customer@example.com',
                name: 'Customer',
                phone: '+1234567890',
                userType: 'customer',
                location: { city: 'Test', district: 'Test' },
                createdAt: new Date(),
                profileImage: null,
                isVerified: true
            };

            User.findById = jest.fn().mockResolvedValue(mockUser);

            const result = await bookingResolvers.Booking.customer(parent);

            expect(result.userId).toBe('customer123');
            expect(result.email).toBe('customer@example.com');
        });

        it('should return null when customer not found', async () => {
            const parent = { customerId: 'invalid' };
            User.findById = jest.fn().mockResolvedValue(null);

            const result = await bookingResolvers.Booking.customer(parent);

            expect(result).toBeNull();
        });

        it('should resolve service field', async () => {
            const parent = { serviceId: 'service123' };
            const mockService = {
                _id: 'service123',
                providerId: 'provider123',
                category: 'Plumbing',
                description: 'Test',
                pricing: 100,
                availability: [],
                location: { city: 'Test', district: 'Test' },
                averageRating: 4.5
            };

            Service.findById = jest.fn().mockResolvedValue(mockService);

            const result = await bookingResolvers.Booking.service(parent);

            expect(result.serviceId).toBe('service123');
            expect(result.category).toBe('Plumbing');
        });

        it('should return null when service not found', async () => {
            const parent = { serviceId: 'invalid' };
            Service.findById = jest.fn().mockResolvedValue(null);

            const result = await bookingResolvers.Booking.service(parent);

            expect(result).toBeNull();
        });
    });
});