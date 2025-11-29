// src/graphql/schema.js
const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Location { city: String, district: String, coordinates: Coordinates }
  type Coordinates { latitude: Float, longitude: Float }
  type TimeSlot { dayOfWeek: String, startTime: String, endTime: String }

  type User {
    userId: ID
    _id: ID
    email: String
    name: String
    phone: String
    userType: String
    location: Location
    createdAt: String
    profileImage: String
    isVerified: Boolean
  }

  type Service {
    _id: ID
    serviceId: ID
    providerId: ID
    category: String
    description: String
    pricing: Float
    availability: [TimeSlot]
    location: Location
    averageRating: Float
  }

  type Query {
    services(category: String, city: String): [Service]
    service(id: ID!): Service
    providers: [User]
  }

  input TimeSlotInput { dayOfWeek: String!, startTime: String!, endTime: String! }
  input LocationInput { city: String!, district: String, coordinates: CoordinatesInput }
  input CoordinatesInput { latitude: Float, longitude: Float }
  input ServiceInput {
    providerId: ID!
    category: String!
    description: String!
    pricing: Float!
    availability: [TimeSlotInput!]
    location: LocationInput!
  }

  type Mutation {
    createService(input: ServiceInput!): Service
    updateService(id: ID!, input: ServiceInput!): Service
    deleteService(id: ID!): Boolean
  }
`;

module.exports = typeDefs;
