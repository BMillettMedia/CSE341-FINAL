import { Service } from '../models/Service';
import { User } from '../models/User';
import { GraphQLError } from 'graphql';

export const serviceResolvers = {
  Query: {
    services: async (_: any, { location, category }: any) => {
      const filter: any = {};
      
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

    service: async (_: any, { id }: any) => {
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

    provider: async (_: any, { id }: any) => {
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
    createService: async (_: any, { input }: any, context: any) => {
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

    updateService: async (_: any, { id, input }: any, context: any) => {
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
        serviceId: updatedService!._id.toString(),
        providerId: updatedService!.providerId,
        category: updatedService!.category,
        description: updatedService!.description,
        pricing: updatedService!.pricing,
        availability: updatedService!.availability,
        location: updatedService!.location,
        averageRating: updatedService!.averageRating
      };
    },

    deleteService: async (_: any, { id }: any, context: any) => {
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
    provider: async (parent: any) => {
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
