// src/graphql/resolvers/serviceResolvers.js
const Service = require('../../models/service');

const serviceResolvers = {
  Query: {
    services: async (_, { category, city }) => {
      const filter = {};
      if (category) filter.category = category;
      if (city) filter['location.city'] = city;
      return await Service.find(filter).lean();
    },
    service: async (_, { id }) => {
      return await Service.findById(id).lean();
    }
  },
  Mutation: {
    createService: async (_, { input }, { user }) => {
      // require auth (for provider)
      if (!user) throw new Error('Authentication required');
      const s = new Service({ ...input, providerId: user._id });
      await s.save();
      return s.toObject();
    },
    updateService: async (_, { id, input }, { user }) => {
      if (!user) throw new Error('Authentication required');
      const existing = await Service.findById(id);
      if (!existing) throw new Error('Not found');
      if (existing.providerId.toString() !== user._id.toString()) throw new Error('Not authorized');
      Object.assign(existing, input);
      await existing.save();
      return existing.toObject();
    },
    deleteService: async (_, { id }, { user }) => {
      if (!user) throw new Error('Authentication required');
      const existing = await Service.findById(id);
      if (!existing) throw new Error('Not found');
      if (existing.providerId.toString() !== user._id.toString()) throw new Error('Not authorized');
      await Service.deleteOne({ _id: id });
      return true;
    }
  }
};

module.exports = serviceResolvers;
