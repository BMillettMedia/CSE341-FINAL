export const typeDefs = `#graphql
  type User {
    userId: ID!
    email: String!
    name: String!
    phone: String!
    userType: String!
    location: Location!
    createdAt: String!
    profileImage: String
    isVerified: Boolean
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Service {
    serviceId: ID!
    providerId: ID!
    provider: User!
    category: String!
    description: String!
    pricing: Float!
    location: Location!
    averageRating: Float!
    availability: [TimeSlot!]!
  }

  type TimeSlot {
    dayOfWeek: String!
    startTime: String!
    endTime: String!
  }

  type Booking {
  bookingId: ID!
  customerId: ID!
  customer: User!
  serviceId: ID!
  service: Service!
  date: String!
  status: String!
  totalCost: Float!
  paymentMethod: String!
  paymentStatus: String
  paymentDate: String
}

  type Review {
    reviewId: ID!
    bookingId: ID!
    customerId: ID!
    customer: User!
    rating: Int!
    comment: String!
    createdAt: String!
  }

  type Category {
    categoryId: ID!
    name: String!
    description: String!
    icon: String!
  }

  type Location {
    city: String!
    district: String!
  }

  input RegisterInput {
    email: String!
    password: String!
    name: String!
    phone: String!
    userType: String!
    location: LocationInput!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input LocationInput {
    city: String!
    district: String!
  }

  input ServiceInput {
    providerId: ID!
    category: String!
    description: String!
    pricing: Float!
    location: LocationInput!
    availability: [TimeSlotInput!]!
  }

  input TimeSlotInput {
    dayOfWeek: String!
    startTime: String!
    endTime: String!
  }

  input BookingInput {
    customerId: ID!
    serviceId: ID!
    date: String!
    paymentMethod: String!
  }

  input ReviewInput {
    bookingId: ID!
    customerId: ID!
    rating: Int!
    comment: String!
  }

  input CategoryInput {
    name: String!
    description: String!
    icon: String!
  }

  type Query {
    me: User
    services(location: String, category: String): [Service!]!
    service(id: ID!): Service
    provider(id: ID!): User
    bookings(userId: ID!): [Booking!]!
    booking(id: ID!): Booking
    bookingsByProvider(providerId: ID!): [Booking!]!
    reviews(serviceId: ID!): [Review!]!
    categories: [Category!]!
    category(id: ID!): Category
  }

  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    createService(input: ServiceInput!): Service!
    updateService(id: ID!, input: ServiceInput!): Service!
    deleteService(id: ID!): Boolean!
    createBooking(input: BookingInput!): Booking!
    updateBookingStatus(id: ID!, status: String!): Booking!
    deleteBooking(id: ID!): Boolean!
    addReview(input: ReviewInput!): Review!
    createCategory(input: CategoryInput!): Category!
    updateCategory(id: ID!, input: CategoryInput!): Category!
    deleteCategory(id: ID!): Boolean!
    markPaymentPaid(bookingId: ID!): Booking!
  }
`;