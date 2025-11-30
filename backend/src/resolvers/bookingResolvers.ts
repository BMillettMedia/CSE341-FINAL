import { Booking } from '../models/Booking';
import { Service } from '../models/Service';
import { User } from '../models/User';
import { GraphQLError } from 'graphql';

export const bookingResolvers = {
    Query: {
        bookings: async (_: any, { userId }: any, context: any) => {
            if (!context.user) {
                throw new GraphQLError('Not authenticated', {
                    extensions: { code: 'UNAUTHENTICATED' }
                });
            }

            const bookings = await Booking.find({ customerId: userId });

            return bookings.map(booking => ({
                bookingId: booking._id.toString(),
                customerId: booking.customerId,
                serviceId: booking.serviceId,
                date: booking.date.toISOString(),
                status: booking.status,
                totalCost: booking.totalCost,
                paymentMethod: booking.paymentMethod,
                paymentStatus: booking.paymentStatus || 'pending',
                paymentDate: booking.paymentDate?.toISOString() || null
            }));
        },

        booking: async (_: any, { id }: any, context: any) => {
            if (!context.user) {
                throw new GraphQLError('Not authenticated', {
                    extensions: { code: 'UNAUTHENTICATED' }
                });
            }

            const booking = await Booking.findById(id);

            if (!booking) {
                throw new GraphQLError('Booking not found', {
                    extensions: { code: 'NOT_FOUND' }
                });
            }

            return {
                bookingId: booking._id.toString(),
                customerId: booking.customerId,
                serviceId: booking.serviceId,
                date: booking.date.toISOString(),
                status: booking.status,
                totalCost: booking.totalCost,
                paymentMethod: booking.paymentMethod,
                paymentStatus: booking.paymentStatus || 'pending',
                paymentDate: booking.paymentDate?.toISOString() || null
            };
        },

        bookingsByProvider: async (_: any, { providerId }: any) => {
            const services = await Service.find({ providerId });
            const serviceIds = services.map(s => s._id.toString());
            const bookings = await Booking.find({ serviceId: { $in: serviceIds } });

            return bookings.map(b => ({
                bookingId: b._id.toString(),
                customerId: b.customerId,
                serviceId: b.serviceId,
                date: b.date.toISOString(),
                status: b.status,
                totalCost: b.totalCost,
                paymentMethod: b.paymentMethod,
                paymentStatus: b.paymentStatus || 'pending',
                paymentDate: b.paymentDate?.toISOString() || null
            }));
        }
    },

    Mutation: {
        createBooking: async (_: any, { input }: any, context: any) => {
            if (!context.user) {
                throw new GraphQLError('Not authenticated', {
                    extensions: { code: 'UNAUTHENTICATED' }
                });
            }

            // Verify service exists
            const service = await Service.findById(input.serviceId);
            if (!service) {
                throw new GraphQLError('Service not found', {
                    extensions: { code: 'NOT_FOUND' }
                });
            }

            // Validate payment method
            const validPaymentMethods = ['cash', 'orange', 'mtn', 'moov'];
            if (!validPaymentMethods.includes(input.paymentMethod)) {
                throw new GraphQLError('Invalid payment method', {
                    extensions: { code: 'BAD_USER_INPUT' }
                });
            }

            const booking = await Booking.create({
                ...input,
                totalCost: service.pricing,
                date: new Date(input.date)
            });

            return {
                bookingId: booking._id.toString(),
                customerId: booking.customerId,
                serviceId: booking.serviceId,
                date: booking.date.toISOString(),
                status: booking.status,
                totalCost: booking.totalCost,
                paymentMethod: booking.paymentMethod,
                paymentStatus: booking.paymentStatus || 'pending',
                paymentDate: booking.paymentDate?.toISOString() || null
            };
        },

        updateBookingStatus: async (_: any, { id, status }: any, context: any) => {
            if (!context.user) {
                throw new GraphQLError('Not authenticated', {
                    extensions: { code: 'UNAUTHENTICATED' }
                });
            }

            const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
            if (!validStatuses.includes(status)) {
                throw new GraphQLError('Invalid status', {
                    extensions: { code: 'BAD_USER_INPUT' }
                });
            }

            const booking = await Booking.findById(id);

            if (!booking) {
                throw new GraphQLError('Booking not found', {
                    extensions: { code: 'NOT_FOUND' }
                });
            }

            const updatedBooking = await Booking.findByIdAndUpdate(
                id,
                { status },
                { new: true }
            );

            return {
                bookingId: updatedBooking!._id.toString(),
                customerId: updatedBooking!.customerId,
                serviceId: updatedBooking!.serviceId,
                date: updatedBooking!.date.toISOString(),
                status: updatedBooking!.status,
                totalCost: updatedBooking!.totalCost,
                paymentMethod: updatedBooking!.paymentMethod,
                paymentStatus: booking.paymentStatus || 'pending',
                paymentDate: booking.paymentDate?.toISOString() || null
            };
        },

        deleteBooking: async (_: any, { id }: any, context: any) => {
            if (!context.user) {
                throw new GraphQLError('Not authenticated', {
                    extensions: { code: 'UNAUTHENTICATED' }
                });
            }

            const booking = await Booking.findById(id);

            if (!booking) {
                throw new GraphQLError('Booking not found', {
                    extensions: { code: 'NOT_FOUND' }
                });
            }

            if (booking.customerId !== context.user.userId && context.user.userType !== 'provider') {
                throw new GraphQLError('Not authorized', {
                    extensions: { code: 'FORBIDDEN' }
                });
            }

            await Booking.findByIdAndDelete(id);
            return true;
        },

        markPaymentPaid: async (_: any, { bookingId }: any, context: any) => {
            if (!context.user) {
                throw new GraphQLError('Not authenticated', {
                    extensions: { code: 'UNAUTHENTICATED' }
                });
            }

            const booking = await Booking.findByIdAndUpdate(
                bookingId,
                {
                    paymentStatus: 'paid',
                    paymentDate: new Date()
                },
                { new: true }
            );

            if (!booking) {
                throw new GraphQLError('Booking not found');
            }

            return {
                bookingId: booking._id.toString(),
                customerId: booking.customerId,
                serviceId: booking.serviceId,
                date: booking.date.toISOString(),
                status: booking.status,
                totalCost: booking.totalCost,
                paymentMethod: booking.paymentMethod,
                paymentStatus: booking.paymentStatus,
                paymentDate: booking.paymentDate?.toISOString()
            };
        }
    },

    Booking: {
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
        },

        service: async (parent: any) => {
            const service = await Service.findById(parent.serviceId);

            if (!service) return null;

            return {
                serviceId: service._id.toString(),
                providerId: service.providerId,
                category: service.category,
                description: service.description,
                pricing: service.pricing,
                availability: service.availability,
                location: service.location,
                averageRating: service.averageRating
            };
        }
    }
};