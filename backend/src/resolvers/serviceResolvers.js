// backend/src/resolvers/serviceResolvers.js
const { Service } = require('../models/Service');
const { User } = require('../models/User');
const { GraphQLError } = require('graphql');

const serviceResolvers = {
  Query: {
    services: async (_, { location, category }) => {
      const filter = {};
      
      if (location) {
        filter['location.city'] = { $regex: location, $options: 'i' };
      }
      
      if (category) {
        filter.category = category;
      }

      const services = await Service.find(filter);
      
      return services.map(service => ({
        serviceId: service._id.toString(),
        providerId: service.providerId,
        category: service.category,
        description: service.description,
        pricing: service.pricing,
        availability: service.availability,
        location: service.location,
        averageRating: service.averageRating
      }));
    },

    service: async (_, { id }) => {
      const service = await Service.findById(id);
      
      if (!service) {
        throw new GraphQLError('Service not found', {
          extensions: { code: 'NOT_FOUND' }
        });
      }

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
    },

    provider: async (_, { id }) => {
      const user = await User.findById(id);
      
      if (!user || user.userType !== 'provider') {
        throw new GraphQLError('Provider not found', {
          extensions: { code: 'NOT_FOUND' }
        });
      }

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
  },

  Mutation: {
    createService: async (_, { input }, context) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      if (context.user.userType !== 'provider') {
        throw new GraphQLError('Only providers can create services', {
          extensions: { code: 'FORBIDDEN' }
        });
      }

      // Validation
      if (input.pricing < 0) {
        throw new GraphQLError('Pricing must be a positive number', {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }

      const service = await Service.create(input);

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
    },

    updateService: async (_, { id, input }, context) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      const service = await Service.findById(id);
      
      if (!service) {
        throw new GraphQLError('Service not found', {
          extensions: { code: 'NOT_FOUND' }
        });
      }

      if (service.providerId !== context.user.userId) {
        throw new GraphQLError('Not authorized to update this service', {
          extensions: { code: 'FORBIDDEN' }
        });
      }

      const updatedService = await Service.findByIdAndUpdate(
        id,
        input,
        { new: true, runValidators: true }
      );

      return {
        serviceId: updatedService._id.toString(),
        providerId: updatedService.providerId,
        category: updatedService.category,
        description: updatedService.description,
        pricing: updatedService.pricing,
        availability: updatedService.availability,
        location: updatedService.location,
        averageRating: updatedService.averageRating
      };
    },

    deleteService: async (_, { id }, context) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      const service = await Service.findById(id);
      
      if (!service) {
        throw new GraphQLError('Service not found', {
          extensions: { code: 'NOT_FOUND' }
        });
      }

      if (service.providerId !== context.user.userId) {
        throw new GraphQLError('Not authorized to delete this service', {
          extensions: { code: 'FORBIDDEN' }
        });
      }

      await Service.findByIdAndDelete(id);
      return true;
    }
  },

  Service: {
    provider: async (parent) => {
      const user = await User.findById(parent.providerId);
      
      if (!user) {
        return null;
      }

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

module.exports = { serviceResolvers };
