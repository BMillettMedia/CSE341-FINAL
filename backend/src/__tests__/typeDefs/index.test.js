const { typeDefs } = require('../../typeDefs');

describe('TypeDefs', () => {
    it('should export typeDefs as string', () => {
        expect(typeof typeDefs).toBe('string');
        expect(typeDefs.length).toBeGreaterThan(0);
    });

    it('should define User type', () => {
        expect(typeDefs).toContain('type User {');
        expect(typeDefs).toContain('userId: ID!');
        expect(typeDefs).toContain('email: String!');
    });

    it('should define Service type', () => {
        expect(typeDefs).toContain('type Service {');
        expect(typeDefs).toContain('serviceId: ID!');
        expect(typeDefs).toContain('pricing: Float!');
    });

    it('should define Booking type', () => {
        expect(typeDefs).toContain('type Booking {');
        expect(typeDefs).toContain('bookingId: ID!');
        expect(typeDefs).toContain('paymentMethod: String!');
    });

    it('should define Review type', () => {
        expect(typeDefs).toContain('type Review {');
        expect(typeDefs).toContain('rating: Int!');
    });

    it('should define Category type', () => {
        expect(typeDefs).toContain('type Category {');
        expect(typeDefs).toContain('name: String!');
    });

    it('should define Query operations', () => {
        expect(typeDefs).toContain('type Query {');
        expect(typeDefs).toContain('me: User');
        expect(typeDefs).toContain('services(location: String, category: String): [Service!]!');
        expect(typeDefs).toContain('bookings(userId: ID!): [Booking!]!');
    });

    it('should define Mutation operations', () => {
        expect(typeDefs).toContain('type Mutation {');
        expect(typeDefs).toContain('register(input: RegisterInput!): AuthPayload!');
        expect(typeDefs).toContain('login(input: LoginInput!): AuthPayload!');
        expect(typeDefs).toContain('createService(input: ServiceInput!): Service!');
        expect(typeDefs).toContain('createBooking(input: BookingInput!): Booking!');
    });

    it('should define input types', () => {
        expect(typeDefs).toContain('input RegisterInput {');
        expect(typeDefs).toContain('input LoginInput {');
        expect(typeDefs).toContain('input ServiceInput {');
        expect(typeDefs).toContain('input BookingInput {');
    });
});