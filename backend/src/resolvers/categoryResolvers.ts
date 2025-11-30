import { Category } from '../models/Category';
import { GraphQLError } from 'graphql';

export const categoryResolvers = {
  Query: {
    categories: async () => {
      const categories = await Category.find();
      
      return categories.map(cat => ({
        categoryId: cat._id.toString(),
        name: cat.name,
        description: cat.description,
        icon: cat.icon
      }));
    },

    category: async (_: any, { id }: any) => {
      const category = await Category.findById(id);
      
      if (!category) {
        throw new GraphQLError('Category not found', {
          extensions: { code: 'NOT_FOUND' }
        });
      }

      return {
        categoryId: category._id.toString(),
        name: category.name,
        description: category.description,
        icon: category.icon
      };
    }
  },

  Mutation: {
    createCategory: async (_: any, { input }: any, context: any) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      const category = await Category.create(input);

      return {
        categoryId: category._id.toString(),
        name: category.name,
        description: category.description,
        icon: category.icon
      };
    },

    updateCategory: async (_: any, { id, input }: any, context: any) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      const category = await Category.findByIdAndUpdate(
        id,
        input,
        { new: true, runValidators: true }
      );

      if (!category) {
        throw new GraphQLError('Category not found', {
          extensions: { code: 'NOT_FOUND' }
        });
      }

      return {
        categoryId: category._id.toString(),
        name: category.name,
        description: category.description,
        icon: category.icon
      };
    },

    deleteCategory: async (_: any, { id }: any, context: any) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      const category = await Category.findByIdAndDelete(id);
      
      if (!category) {
        throw new GraphQLError('Category not found', {
          extensions: { code: 'NOT_FOUND' }
        });
      }

      return true;
    }
  }
};
