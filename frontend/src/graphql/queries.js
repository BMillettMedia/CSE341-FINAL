import gql from 'graphql-tag'

export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        userId
        email
        name
        userType
      }
    }
  }
`

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        userId
        email
        name
        userType
      }
    }
  }
`

export const GET_SERVICES = gql`
  query GetServices($location: String, $category: String) {
    services(location: $location, category: $category) {
      serviceId
      category
      description
      pricing
      location {
        city
        district
      }
      averageRating
      provider {
        name
        phone
      }
    }
  }
`

export const GET_SERVICE = gql`
  query GetService($id: ID!) {
    service(id: $id) {
      serviceId
      category
      description
      pricing
      availability {
        dayOfWeek
        startTime
        endTime
      }
      location {
        city
        district
      }
      averageRating
      provider {
        userId
        name
        phone
        location {
          city
          district
        }
      }
    }
  }
`

export const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      categoryId
      name
      description
      icon
    }
  }
`

export const CREATE_BOOKING = gql`
  mutation CreateBooking($input: BookingInput!) {
    createBooking(input: $input) {
      bookingId
      date
      status
      totalCost
      paymentMethod
    }
  }
`

export const GET_BOOKINGS = gql`
  query GetBookings($userId: ID!) {
    bookings(userId: $userId) {
      bookingId
      date
      status
      totalCost
      paymentMethod
      service {
        description
        category
      }
    }
  }
`

export const ADD_REVIEW = gql`
  mutation AddReview($input: ReviewInput!) {
    addReview(input: $input) {
      reviewId
      rating
      comment
      createdAt
    }
  }
`

export const GET_REVIEWS = gql`
  query GetReviews($serviceId: ID!) {
    reviews(serviceId: $serviceId) {
      reviewId
      rating
      comment
      createdAt
      customer {
        name
      }
    }
  }
`
