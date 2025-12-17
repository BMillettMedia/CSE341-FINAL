const { Category } = require('../../models/Category');

describe('Category Model', () => {
    it('should have required fields defined', () => {
        const categorySchema = Category.schema.paths;

        expect(categorySchema.name).toBeDefined();
        expect(categorySchema.description).toBeDefined();
        expect(categorySchema.icon).toBeDefined();
    });

    it('should have name as unique field', () => {
        const nameUnique = Category.schema.path('name').options.unique;

        expect(nameUnique).toBe(true);
    });

    it('should trim name field', () => {
        const nameTrim = Category.schema.path('name').options.trim;

        expect(nameTrim).toBe(true);
    });
});