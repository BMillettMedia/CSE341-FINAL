const { categoryResolvers } = require('../../resolvers/categoryResolvers');
const { Category } = require('../../models/Category');

jest.mock('../../models/Category');

describe('Category Resolvers', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Query: categories', () => {
        it('should return all categories', async () => {
            const mockCategories = [
                {
                    _id: '1',
                    name: 'Plumbing',
                    description: 'Plumbing services',
                    icon: 'plumbing-icon'
                },
                {
                    _id: '2',
                    name: 'Electrical',
                    description: 'Electrical services',
                    icon: 'electrical-icon'
                }
            ];

            Category.find = jest.fn().mockResolvedValue(mockCategories);

            const result = await categoryResolvers.Query.categories();

            expect(result).toHaveLength(2);
            expect(result[0].name).toBe('Plumbing');
            expect(result[1].name).toBe('Electrical');
            expect(Category.find).toHaveBeenCalled();
        });

        it('should return empty array when no categories', async () => {
            Category.find = jest.fn().mockResolvedValue([]);

            const result = await categoryResolvers.Query.categories();

            expect(result).toHaveLength(0);
        });
    });

    describe('Query: category', () => {
        it('should return single category', async () => {
            const mockCategory = {
                _id: '1',
                name: 'Cleaning',
                description: 'Cleaning services',
                icon: 'cleaning-icon'
            };

            Category.findById = jest.fn().mockResolvedValue(mockCategory);

            const result = await categoryResolvers.Query.category(null, { id: '1' });

            expect(result.categoryId).toBe('1');
            expect(result.name).toBe('Cleaning');
            expect(Category.findById).toHaveBeenCalledWith('1');
        });

        it('should throw error when category not found', async () => {
            Category.findById = jest.fn().mockResolvedValue(null);

            await expect(
                categoryResolvers.Query.category(null, { id: 'invalid' })
            ).rejects.toThrow('Category not found');
        });
    });

    describe('Mutation: createCategory', () => {
        it('should create category successfully', async () => {
            const input = {
                name: 'Carpentry',
                description: 'Wood work services',
                icon: 'carpentry-icon'
            };

            const mockCategory = {
                _id: 'category123',
                ...input
            };

            Category.create = jest.fn().mockResolvedValue(mockCategory);
            const context = { user: { userId: 'admin123' } };

            const result = await categoryResolvers.Mutation.createCategory(null, { input }, context);

            expect(result.categoryId).toBe('category123');
            expect(result.name).toBe('Carpentry');
            expect(Category.create).toHaveBeenCalledWith(input);
        });

        it('should throw error when not authenticated', async () => {
            const input = { name: 'Test' };
            const context = { user: null };

            await expect(
                categoryResolvers.Mutation.createCategory(null, { input }, context)
            ).rejects.toThrow('Not authenticated');
        });
    });

    describe('Mutation: updateCategory', () => {
        it('should update category successfully', async () => {
            const input = { name: 'Updated Name' };
            const updatedCategory = {
                _id: '1',
                name: 'Updated Name',
                description: 'Updated description',
                icon: 'icon'
            };

            Category.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedCategory);
            const context = { user: { userId: 'admin123' } };

            const result = await categoryResolvers.Mutation.updateCategory(
                null,
                { id: '1', input },
                context
            );

            expect(result.name).toBe('Updated Name');
            expect(Category.findByIdAndUpdate).toHaveBeenCalledWith('1', input, { new: true, runValidators: true });
        });

        it('should throw error when category not found', async () => {
            Category.findByIdAndUpdate = jest.fn().mockResolvedValue(null);
            const context = { user: { userId: 'admin123' } };

            await expect(
                categoryResolvers.Mutation.updateCategory(null, { id: 'invalid', input: {} }, context)
            ).rejects.toThrow('Category not found');
        });

        it('should throw error when not authenticated', async () => {
            const context = { user: null };

            await expect(
                categoryResolvers.Mutation.updateCategory(null, { id: '1', input: {} }, context)
            ).rejects.toThrow('Not authenticated');
        });
    });

    describe('Mutation: deleteCategory', () => {
        it('should delete category successfully', async () => {
            const mockCategory = {
                _id: '1',
                name: 'Test Category'
            };

            Category.findByIdAndDelete = jest.fn().mockResolvedValue(mockCategory);
            const context = { user: { userId: 'admin123' } };

            const result = await categoryResolvers.Mutation.deleteCategory(null, { id: '1' }, context);

            expect(result).toBe(true);
            expect(Category.findByIdAndDelete).toHaveBeenCalledWith('1');
        });

        it('should throw error when category not found', async () => {
            Category.findByIdAndDelete = jest.fn().mockResolvedValue(null);
            const context = { user: { userId: 'admin123' } };

            await expect(
                categoryResolvers.Mutation.deleteCategory(null, { id: 'invalid' }, context)
            ).rejects.toThrow('Category not found');
        });

        it('should throw error when not authenticated', async () => {
            const context = { user: null };

            await expect(
                categoryResolvers.Mutation.deleteCategory(null, { id: '1' }, context)
            ).rejects.toThrow('Not authenticated');
        });
    });
});