const { serviceResolvers } = require('../../resolvers/serviceResolvers');
const { Service } = require('../../models/Service');
const { User } = require('../../models/User');

jest.mock('../../models/Service');
jest.mock('../../models/User');

describe('Service Resolvers', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Query: services', () => {
        it('should return all services', async () => {
            const mockServices = [
                {
                    _id: '1',
                    providerId: 'provider123',
                    category: 'Plumbing',
                    description: 'Test service',
                    pricing: 100,
                    availability: true,
                    location: { city: 'Test City', district: 'Test District' },
                    averageRating: 4.5
                }
            ];

            Service.find = jest.fn().mockResolvedValue(mockServices);

            const result = await serviceResolvers.Query.services(null, {});

            expect(result).toHaveLength(1);
            expect(result[0].category).toBe('Plumbing');
            expect(Service.find).toHaveBeenCalledWith({});
        });

        it('should filter services by location', async () => {
            Service.find = jest.fn().mockResolvedValue([]);

            await serviceResolvers.Query.services(null, { location: 'Test City' });

            expect(Service.find).toHaveBeenCalledWith({
                'location.city': { $regex: 'Test City', $options: 'i' }
            });
        });

        it('should filter services by category', async () => {
            Service.find = jest.fn().mockResolvedValue([]);

            await serviceResolvers.Query.services(null, { category: 'Plumbing' });

            expect(Service.find).toHaveBeenCalledWith({
                category: 'Plumbing'
            });
        });
    });

    describe('Query: service', () => {
        it('should return single service', async () => {
            const mockService = {
                _id: '1',
                providerId: 'provider123',
                category: 'Electrical',
                description: 'Test service',
                pricing: 150,
                availability: true,
                location: { city: 'Test', district: 'Test' },
                averageRating: 5.0
            };

            Service.findById = jest.fn().mockResolvedValue(mockService);

            const result = await serviceResolvers.Query.service(null, { id: '1' });

            expect(result.serviceId).toBe('1');
            expect(result.category).toBe('Electrical');
        });

        it('should throw error when service not found', async () => {
            Service.findById = jest.fn().mockResolvedValue(null);

            await expect(
                serviceResolvers.Query.service(null, { id: 'invalid' })
            ).rejects.toThrow('Service not found');
        });
    });

    describe('Mutation: createService', () => {
        it('should create service successfully', async () => {
            const input = {
                providerId: 'provider123',
                category: 'Cleaning',
                description: 'Test service',
                pricing: 80,
                availability: true,
                location: { city: 'Test', district: 'Test' }
            };

            const mockService = {
                _id: 'service123',
                ...input,
                averageRating: 0
            };

            Service.create = jest.fn().mockResolvedValue(mockService);
            const context = { user: { userId: 'provider123', userType: 'provider' } };

            const result = await serviceResolvers.Mutation.createService(null, { input }, context);

            expect(result.serviceId).toBe('service123');
            expect(result.category).toBe('Cleaning');
            expect(Service.create).toHaveBeenCalledWith(input);
        });

        it('should throw error when not authenticated', async () => {
            const input = { pricing: 100 };
            const context = { user: null };

            await expect(
                serviceResolvers.Mutation.createService(null, { input }, context)
            ).rejects.toThrow('Not authenticated');
        });

        it('should throw error when user is not a provider', async () => {
            const input = { pricing: 100 };
            const context = { user: { userId: '123', userType: 'customer' } };

            await expect(
                serviceResolvers.Mutation.createService(null, { input }, context)
            ).rejects.toThrow('Only providers can create services');
        });

        it('should throw error for negative pricing', async () => {
            const input = { pricing: -50 };
            const context = { user: { userId: '123', userType: 'provider' } };

            await expect(
                serviceResolvers.Mutation.createService(null, { input }, context)
            ).rejects.toThrow('Pricing must be a positive number');
        });
    });

    describe('Mutation: updateService', () => {
        it('should update service successfully', async () => {
            const mockService = {
                _id: '1',
                providerId: 'provider123',
                pricing: 100
            };

            const updatedService = {
                ...mockService,
                pricing: 150,
                category: 'Updated',
                description: 'Updated',
                availability: true,
                location: { city: 'Test', district: 'Test' },
                averageRating: 4.0
            };

            Service.findById = jest.fn().mockResolvedValue(mockService);
            Service.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedService);
            const context = { user: { userId: 'provider123', userType: 'provider' } };

            const result = await serviceResolvers.Mutation.updateService(
                null,
                { id: '1', input: { pricing: 150 } },
                context
            );

            expect(result.pricing).toBe(150);
        });

        it('should throw error when not authorized', async () => {
            const mockService = {
                _id: '1',
                providerId: 'differentProvider'
            };

            Service.findById = jest.fn().mockResolvedValue(mockService);
            const context = { user: { userId: 'provider123', userType: 'provider' } };

            await expect(
                serviceResolvers.Mutation.updateService(null, { id: '1', input: {} }, context)
            ).rejects.toThrow('Not authorized to update this service');
        });
    });

    describe('Mutation: deleteService', () => {
        it('should delete service successfully', async () => {
            const mockService = {
                _id: '1',
                providerId: 'provider123'
            };

            Service.findById = jest.fn().mockResolvedValue(mockService);
            Service.findByIdAndDelete = jest.fn().mockResolvedValue(mockService);
            const context = { user: { userId: 'provider123', userType: 'provider' } };

            const result = await serviceResolvers.Mutation.deleteService(null, { id: '1' }, context);

            expect(result).toBe(true);
            expect(Service.findByIdAndDelete).toHaveBeenCalledWith('1');
        });

        it('should throw error when not authorized', async () => {
            const mockService = {
                _id: '1',
                providerId: 'differentProvider'
            };

            Service.findById = jest.fn().mockResolvedValue(mockService);
            const context = { user: { userId: 'provider123', userType: 'provider' } };

            await expect(
                serviceResolvers.Mutation.deleteService(null, { id: '1' }, context)
            ).rejects.toThrow('Not authorized to delete this service');
        });
    });

    describe('Query: provider', () => {
        it('should return provider user', async () => {
            const mockUser = {
                _id: 'provider123',
                email: 'provider@example.com',
                name: 'Provider Name',
                phone: '+1234567890',
                userType: 'provider',
                location: { city: 'Test', district: 'Test' },
                createdAt: new Date(),
                profileImage: null,
                isVerified: true
            };

            User.findById = jest.fn().mockResolvedValue(mockUser);

            const result = await serviceResolvers.Query.provider(null, { id: 'provider123' });

            expect(result.userId).toBe('provider123');
            expect(result.userType).toBe('provider');
        });

        it('should throw error when user is not a provider', async () => {
            const mockUser = {
                _id: 'user123',
                userType: 'customer'
            };

            User.findById = jest.fn().mockResolvedValue(mockUser);

            await expect(
                serviceResolvers.Query.provider(null, { id: 'user123' })
            ).rejects.toThrow('Provider not found');
        });

        it('should throw error when user not found', async () => {
            User.findById = jest.fn().mockResolvedValue(null);

            await expect(
                serviceResolvers.Query.provider(null, { id: 'invalid' })
            ).rejects.toThrow('Provider not found');
        });
    });

    describe('Service field resolvers', () => {
        it('should resolve provider field', async () => {
            const parent = { providerId: 'provider123' };
            const mockUser = {
                _id: 'provider123',
                email: 'provider@example.com',
                name: 'Provider',
                phone: '+1234567890',
                userType: 'provider',
                location: { city: 'Test', district: 'Test' },
                createdAt: new Date(),
                profileImage: null,
                isVerified: true
            };

            User.findById = jest.fn().mockResolvedValue(mockUser);

            const result = await serviceResolvers.Service.provider(parent);

            expect(result.userId).toBe('provider123');
            expect(result.userType).toBe('provider');
        });

        it('should return null when provider not found', async () => {
            const parent = { providerId: 'invalid' };
            User.findById = jest.fn().mockResolvedValue(null);

            const result = await serviceResolvers.Service.provider(parent);

            expect(result).toBeNull();
        });
    });
});