const {
    generateToken,
    verifyToken,
    hashPassword,
    comparePassword,
    validateEmail,
    validatePhone
} = require('../../utils/auth');

describe('Auth Utils', () => {
    describe('generateToken', () => {
        it('should generate a valid JWT token', () => {
            const user = {
                userId: '123',
                email: 'test@example.com',
                userType: 'customer'
            };
            const token = generateToken(user);
            expect(token).toBeDefined();
            expect(typeof token).toBe('string');
        });
    });

    describe('verifyToken', () => {
        it('should verify a valid token', () => {
            const user = {
                userId: '123',
                email: 'test@example.com',
                userType: 'customer'
            };
            const token = generateToken(user);
            const decoded = verifyToken(token);
            expect(decoded).toBeDefined();
            expect(decoded.userId).toBe('123');
            expect(decoded.email).toBe('test@example.com');
        });

        it('should return null for invalid token', () => {
            const result = verifyToken('invalid-token');
            expect(result).toBeNull();
        });
    });

    describe('hashPassword', () => {
        it('should hash password correctly', async () => {
            const password = 'testPassword123';
            const hashed = await hashPassword(password);
            expect(hashed).toBeDefined();
            expect(hashed).not.toBe(password);
            expect(hashed.length).toBeGreaterThan(0);
        });
    });

    describe('comparePassword', () => {
        it('should return true for matching passwords', async () => {
            const password = 'testPassword123';
            const hashed = await hashPassword(password);
            const result = await comparePassword(password, hashed);
            expect(result).toBe(true);
        });

        it('should return false for non-matching passwords', async () => {
            const password = 'testPassword123';
            const hashed = await hashPassword(password);
            const result = await comparePassword('wrongPassword', hashed);
            expect(result).toBe(false);
        });
    });

    describe('validateEmail', () => {
        it('should validate correct email formats', () => {
            expect(validateEmail('test@example.com')).toBe(true);
            expect(validateEmail('user.name@domain.co.uk')).toBe(true);
            expect(validateEmail('user+tag@example.com')).toBe(true);
        });

        it('should reject invalid email formats', () => {
            expect(validateEmail('invalid')).toBe(false);
            expect(validateEmail('invalid@')).toBe(false);
            expect(validateEmail('@invalid.com')).toBe(false);
            expect(validateEmail('invalid@.com')).toBe(false);
        });
    });

    describe('validatePhone', () => {
        it('should validate correct phone formats', () => {
            expect(validatePhone('+1234567890')).toBe(true);
            expect(validatePhone('1234567890')).toBe(true);
            expect(validatePhone('+1 234 567 8900')).toBe(true);
            expect(validatePhone('123-456-7890')).toBe(true);
        });

        it('should reject invalid phone formats', () => {
            expect(validatePhone('123')).toBe(false);
            expect(validatePhone('abc')).toBe(false);
            expect(validatePhone('')).toBe(false);
        });
    });
});