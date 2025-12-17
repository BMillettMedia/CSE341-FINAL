const { User } = require('../../models/User');

describe('User Model', () => {
    it('should have required fields defined', () => {
        const userSchema = User.schema.paths;

        expect(userSchema.email).toBeDefined();
        expect(userSchema.name).toBeDefined();
        expect(userSchema.phone).toBeDefined();
        expect(userSchema.userType).toBeDefined();
        expect(userSchema.location).toBeDefined();
    });

    it('should have correct userType enum values', () => {
        const userTypeEnum = User.schema.path('userType').enumValues;

        expect(userTypeEnum).toContain('customer');
        expect(userTypeEnum).toContain('provider');
    });

    it('should have isVerified default to false', () => {
        const isVerifiedDefault = User.schema.path('isVerified').defaultValue;

        expect(isVerifiedDefault).toBe(false);
    });
});