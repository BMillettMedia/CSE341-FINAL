<template>
  <div class="bookings-container">
    <nav class="navbar">
      <h1>Service Marketplace</h1>
      <div class="nav-links">
        <router-link to="/services">Services</router-link>
        <router-link to="/bookings" class="active">My Bookings</router-link>
        <router-link v-if="isProvider" to="/dashboard">Dashboard</router-link>
        <button @click="handleLogout" class="logout-btn">Logout</button>
      </div>
    </nav>

    <div class="content">
      <h2>My Bookings</h2>
      
      <div v-if="loading" class="loading">Loading bookings...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else-if="bookings.length === 0" class="no-data">No bookings yet</div>
      
      <div v-else class="bookings-list">
        <div v-for="booking in bookings" :key="booking.bookingId" class="booking-card">
          <div class="booking-header">
            <h3>{{ booking.service.category }}</h3>
            <span :class="['status', booking.status]">{{ booking.status }}</span>
          </div>
          <p class="description">{{ booking.service.description }}</p>
          <div class="booking-details">
            <p><strong>Date:</strong> {{ formatDate(booking.date) }}</p>
            <p><strong>Cost:</strong> {{ booking.totalCost }} FCFA</p>
            <p><strong>Payment:</strong> {{ formatPaymentMethod(booking.paymentMethod) }}</p>
            <p><strong>Payment Status:</strong>
              <span :class="['payment-status', booking.paymentStatus]">
      {{ booking.paymentStatus }}
    </span>
            </p>
          </div>
          <div v-if="booking.status === 'completed' && booking.paymentStatus === 'pending'" class="actions">
            <button @click="markAsPaid(booking.bookingId)" class="pay-btn">Mark as Paid</button>
          </div>
          <div v-if="booking.status === 'completed' && !booking.hasReview" class="actions">
            <button @click="openReviewModal(booking)" class="review-btn">Leave Review</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Review Modal -->
    <div v-if="showReviewModal" class="modal" @click.self="closeReviewModal">
      <div class="modal-content">
        <h3>Leave a Review</h3>
        <form @submit.prevent="submitReview">
          <div class="form-group">
            <label>Rating</label>
            <select v-model="reviewForm.rating" required>
              <option value="">Select rating</option>
              <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
              <option value="4">⭐⭐⭐⭐ Good</option>
              <option value="3">⭐⭐⭐ Average</option>
              <option value="2">⭐⭐ Poor</option>
              <option value="1">⭐ Bad</option>
            </select>
          </div>
          <div class="form-group">
            <label>Comment</label>
            <textarea v-model="reviewForm.comment" required rows="4" placeholder="Share your experience..."></textarea>
          </div>
          <p v-if="reviewError" class="error">{{ reviewError }}</p>
          <div class="modal-actions">
            <button type="button" @click="closeReviewModal" class="cancel-btn">Cancel</button>
            <button type="submit" :disabled="reviewLoading" class="submit-btn">
              {{ reviewLoading ? 'Submitting...' : 'Submit Review' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import apolloClient from '../apollo'
import gql from 'graphql-tag'

const GET_BOOKINGS = gql`
  query GetBookings($userId: ID!) {
    bookings(userId: $userId) {
      bookingId
      date
      status
      totalCost
      paymentMethod
      paymentStatus
      paymentDate
      service {
        description
        category
      }
    }
  }
`

const ADD_REVIEW = gql`
  mutation AddReview($input: ReviewInput!) {
    addReview(input: $input) {
      reviewId
      rating
      comment
      createdAt
    }
  }
`

const MARK_PAID = gql`
  mutation MarkPaid($bookingId: ID!) {
    markPaymentPaid(bookingId: $bookingId) {
      bookingId
      paymentStatus
      paymentDate
    }
  }
`

export default {
  name: 'Bookings',
  setup() {
    const router = useRouter()
    const bookings = ref([])
    const loading = ref(true)
    const error = ref('')
    const showReviewModal = ref(false)
    const selectedBooking = ref(null)
    const reviewForm = ref({ rating: '', comment: '' })
    const reviewLoading = ref(false)
    const reviewError = ref('')

    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const isProvider = computed(() => user.userType === 'provider')

    const fetchBookings = async () => {
      try {
        const { data } = await apolloClient.query({
          query: GET_BOOKINGS,
          variables: { userId: user.userId },
          fetchPolicy: 'network-only'
        })
        bookings.value = data.bookings
      } catch (err) {
        error.value = err.message
      } finally {
        loading.value = false
      }
    }

    const formatDate = (dateString) => new Date(dateString).toLocaleString()

    const formatPaymentMethod = (method) => {
      const methods = {
        cash: 'Cash',
        orange: 'Orange Money',
        mtn: 'MTN Mobile Money',
        moov: 'Moov Money'
      }
      return methods[method] || method
    }

    const openReviewModal = (booking) => {
      selectedBooking.value = booking
      showReviewModal.value = true
    }

    const closeReviewModal = () => {
      showReviewModal.value = false
      selectedBooking.value = null
      reviewForm.value = { rating: '', comment: '' }
      reviewError.value = ''
    }

    const submitReview = async () => {
      reviewLoading.value = true
      reviewError.value = ''

      try {
        await apolloClient.mutate({
          mutation: ADD_REVIEW,
          variables: {
            input: {
              bookingId: selectedBooking.value.bookingId,
              customerId: user.userId,
              rating: parseInt(reviewForm.value.rating),
              comment: reviewForm.value.comment
            }
          }
        })
        closeReviewModal()
        fetchBookings()
      } catch (err) {
        reviewError.value = err.message
      } finally {
        reviewLoading.value = false
      }
    }

    const markAsPaid = async (bookingId) => {
      try {
        await apolloClient.mutate({
          mutation: MARK_PAID,
          variables: { bookingId }
        })
        fetchBookings()
      } catch (err) {
        alert(err.message)
      }
    }

    const handleLogout = () => {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push('/login')
    }

    onMounted(() => {
      fetchBookings()
    })

    return {
      bookings,
      loading,
      error,
      isProvider,
      showReviewModal,
      reviewForm,
      reviewLoading,
      reviewError,
      formatDate,
      formatPaymentMethod,
      openReviewModal,
      closeReviewModal,
      submitReview,
      markAsPaid,
      handleLogout
    }
  }
}
</script>

<style scoped>
.bookings-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.navbar {
  background: white;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar h1 {
  margin: 0;
  font-size: 24px;
}

.nav-links {
  display: flex;
  gap: 20px;
  align-items: center;
}

.nav-links a {
  text-decoration: none;
  color: #007bff;
  font-weight: 500;
}

.nav-links a.active {
  color: #0056b3;
  font-weight: bold;
}

.logout-btn {
  padding: 8px 20px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.content {
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.content h2 {
  margin-bottom: 30px;
}

.loading, .error, .no-data {
  text-align: center;
  padding: 40px;
  font-size: 18px;
}

.bookings-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.booking-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.booking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.booking-header h3 {
  margin: 0;
  color: #007bff;
}

.status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
}

.status.pending {
  background: #ffc107;
  color: #000;
}

.status.confirmed {
  background: #17a2b8;
  color: white;
}

.status.completed {
  background: #28a745;
  color: white;
}

.status.cancelled {
  background: #dc3545;
  color: white;
}

.description {
  color: #666;
  margin-bottom: 15px;
}

.booking-details p {
  margin: 8px 0;
}

.payment-status {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
}

.payment-status.pending {
  background: #ffc107;
  color: #000;
}

.payment-status.paid {
  background: #28a745;
  color: white;
}

.payment-status.refunded {
  background: #6c757d;
  color: white;
}

.actions {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  gap: 10px;
}

.review-btn {
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.pay-btn {
  padding: 8px 16px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.cancel-btn {
  padding: 10px 20px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.submit-btn {
  padding: 10px 20px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error {
  color: red;
  margin-bottom: 15px;
}
</style>
