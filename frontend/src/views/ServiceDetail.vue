<template>
  <div class="service-detail-container">
    <nav class="navbar">
      <h1>Service Marketplace</h1>
      <div class="nav-links">
        <router-link to="/services">Services</router-link>
        <router-link to="/bookings">My Bookings</router-link>
        <button @click="handleLogout" class="logout-btn">Logout</button>
      </div>
    </nav>

    <div class="content">
      <div v-if="loading" class="loading">Loading...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else-if="service" class="service-detail">
        <div class="service-header">
          <h2>{{ service.category }}</h2>
          <span class="rating">⭐ {{ service.averageRating.toFixed(1) }}</span>
        </div>

        <div class="service-info">
          <p class="description">{{ service.description }}</p>
          <p class="price">{{ service.pricing }} FCFA</p>
          <p><strong>Location:</strong> {{ service.location.city }}, {{ service.location.district }}</p>
        </div>

        <div class="provider-info">
          <h3>Provider</h3>
          <p><strong>Name:</strong> {{ service.provider.name }}</p>
          <p><strong>Phone:</strong> {{ service.provider.phone }}</p>
          <p><strong>Location:</strong> {{ service.provider.location.city }}, {{ service.provider.location.district }}</p>
        </div>

        <div class="availability">
          <h3>Availability</h3>
          <div class="time-slots">
            <div v-for="slot in service.availability" :key="slot.dayOfWeek" class="time-slot">
              <strong>{{ slot.dayOfWeek }}:</strong> {{ slot.startTime }} - {{ slot.endTime }}
            </div>
          </div>
        </div>

        <div class="booking-form">
          <h3>Book This Service</h3>
          <form @submit.prevent="handleBooking">
            <div class="form-group">
              <label>Date & Time</label>
              <input v-model="bookingForm.date" type="datetime-local" required />
            </div>
            <div class="form-group">
              <label>Payment Method</label>
              <select v-model="bookingForm.paymentMethod" required>
                <option value="cash">Cash</option>
                <option value="orange">Orange Money</option>
                <option value="mtn">MTN Mobile Money</option>
                <option value="moov">Moov Money</option>
              </select>
            </div>
            <p v-if="bookingError" class="error">{{ bookingError }}</p>
            <p v-if="bookingSuccess" class="success">{{ bookingSuccess }}</p>
            <button type="submit" :disabled="bookingLoading">
              {{ bookingLoading ? 'Booking...' : 'Book Now' }}
            </button>
          </form>
        </div>

        <div class="reviews-section">
          <h3>Reviews</h3>
          <div v-if="reviews.length === 0" class="no-reviews">No reviews yet</div>
          <div v-else class="reviews-list">
            <div v-for="review in reviews" :key="review.reviewId" class="review-card">
              <div class="review-header">
                <span class="reviewer">{{ review.customer.name }}</span>
                <span class="rating">⭐ {{ review.rating }}</span>
              </div>
              <p class="comment">{{ review.comment }}</p>
              <span class="date">{{ formatDate(review.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import apolloClient from '../apollo'
import { GET_SERVICE, GET_REVIEWS, CREATE_BOOKING } from '../graphql/queries'

export default {
  name: 'ServiceDetail',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const service = ref(null)
    const reviews = ref([])
    const loading = ref(true)
    const error = ref('')
    const bookingForm = ref({
      date: '',
      paymentMethod: 'cash'
    })
    const bookingLoading = ref(false)
    const bookingError = ref('')
    const bookingSuccess = ref('')

    const fetchService = async () => {
      try {
        const { data } = await apolloClient.query({
          query: GET_SERVICE,
          variables: { id: route.params.id }
        })
        service.value = data.service
      } catch (err) {
        error.value = err.message
      } finally {
        loading.value = false
      }
    }

    const fetchReviews = async () => {
      try {
        const { data } = await apolloClient.query({
          query: GET_REVIEWS,
          variables: { serviceId: route.params.id }
        })
        reviews.value = data.reviews
      } catch (err) {
        console.error('Error fetching reviews:', err)
      }
    }

    const handleBooking = async () => {
      bookingLoading.value = true
      bookingError.value = ''
      bookingSuccess.value = ''

      const user = JSON.parse(localStorage.getItem('user'))
      
      try {
        await apolloClient.mutate({
          mutation: CREATE_BOOKING,
          variables: {
            input: {
              customerId: user.userId,
              serviceId: route.params.id,
              date: bookingForm.value.date,
              paymentMethod: bookingForm.value.paymentMethod
            }
          }
        })
        bookingSuccess.value = 'Booking created successfully!'
        setTimeout(() => router.push('/bookings'), 2000)
      } catch (err) {
        bookingError.value = err.message
      } finally {
        bookingLoading.value = false
      }
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString()
    }

    const handleLogout = () => {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push('/login')
    }

    onMounted(() => {
      fetchService()
      fetchReviews()
    })

    return {
      service,
      reviews,
      loading,
      error,
      bookingForm,
      bookingLoading,
      bookingError,
      bookingSuccess,
      handleBooking,
      formatDate,
      handleLogout
    }
  }
}
</script>

<style scoped>
.service-detail-container {
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
  max-width: 900px;
  margin: 0 auto;
}

.service-detail {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.service-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
}

.service-header h2 {
  margin: 0;
  color: #007bff;
}

.rating {
  font-size: 18px;
  font-weight: bold;
}

.service-info {
  margin-bottom: 30px;
}

.description {
  font-size: 16px;
  line-height: 1.6;
  color: #666;
  margin-bottom: 15px;
}

.price {
  font-size: 24px;
  font-weight: bold;
  color: #28a745;
  margin-bottom: 10px;
}

.provider-info, .availability, .booking-form, .reviews-section {
  margin-top: 30px;
  padding-top: 30px;
  border-top: 2px solid #f0f0f0;
}

h3 {
  margin-bottom: 15px;
  color: #333;
}

.time-slots {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
}

.time-slot {
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
}

.booking-form form {
  max-width: 400px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

button[type="submit"] {
  width: 100%;
  padding: 12px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}

button[type="submit"]:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.success {
  color: #28a745;
  margin-bottom: 15px;
}

.error {
  color: red;
  margin-bottom: 15px;
}

.loading {
  text-align: center;
  padding: 40px;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.review-card {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 4px;
}

.review-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.reviewer {
  font-weight: bold;
}

.comment {
  color: #666;
  margin-bottom: 8px;
}

.date {
  font-size: 12px;
  color: #999;
}

.no-reviews {
  color: #999;
  text-align: center;
  padding: 20px;
}
</style>
