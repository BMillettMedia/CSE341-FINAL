<template>
  <div class="dashboard-container">
    <nav class="navbar">
      <h1>Provider Dashboard</h1>
      <div class="nav-links">
        <router-link to="/services">Services</router-link>
        <router-link to="/dashboard" class="active">Dashboard</router-link>
        <button @click="handleLogout" class="logout-btn">Logout</button>
      </div>
    </nav>

    <div class="content">
      <!-- My Services Section -->
      <div class="dashboard-header">
        <h2>My Services</h2>
        <button @click="showCreateModal = true" class="create-btn">+ Create Service</button>
      </div>

      <div v-if="loading" class="loading">Loading...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else-if="services.length === 0" class="no-data">
        <p>No services yet. Create your first service!</p>
      </div>

      <div v-else class="services-grid">
        <div v-for="service in services" :key="service.serviceId" class="service-card">
          <h3>{{ service.category }}</h3>
          <p class="description">{{ service.description }}</p>
          <p class="price">{{ service.pricing }} FCFA</p>
          <p><strong>Rating:</strong> {{ service.averageRating }}/5</p>
          <div class="actions">
            <button @click="editService(service)" class="edit-btn">Edit</button>
            <button @click="deleteServiceConfirm(service.serviceId)" class="delete-btn">Delete</button>
          </div>
        </div>
      </div>

      <!-- Booking Requests Section -->
      <div class="bookings-section">
        <h2>Service Requests</h2>
        <div v-if="bookingsLoading" class="loading">Loading bookings...</div>
        <div v-else-if="providerBookings.length === 0" class="no-data">
          <p>No booking requests yet</p>
        </div>
        <div v-else class="bookings-grid">
          <div v-for="booking in providerBookings" :key="booking.bookingId" class="booking-card">
            <div class="booking-header">
              <h4>{{ booking.service.category }}</h4>
              <span :class="['status', booking.status]">{{ booking.status }}</span>
            </div>
            <p><strong>Customer:</strong> {{ booking.customer.name }}</p>
            <p><strong>Phone:</strong> {{ booking.customer.phone }}</p>
            <p><strong>Date:</strong> {{ formatDate(booking.date) }}</p>
            <p><strong>Cost:</strong> {{ booking.totalCost }} FCFA</p>
            <p><strong>Payment:</strong> {{ formatPayment(booking.paymentMethod) }}</p>
            <p><strong>Payment:</strong> {{ formatPayment(booking.paymentMethod) }}</p>
            <p><strong>Payment Status:</strong>
              <span :class="['payment-status', booking.paymentStatus]">
    {{ booking.paymentStatus || 'pending' }}
  </span>
            </p>
            <div v-if="booking.status === 'pending'" class="booking-actions">
              <button @click="updateBookingStatus(booking.bookingId, 'confirmed')" class="confirm-btn">
                Confirm
              </button>
              <button @click="updateBookingStatus(booking.bookingId, 'cancelled')" class="cancel-btn">
                Decline
              </button>
            </div>
            <div v-if="booking.status === 'confirmed'" class="booking-actions">
              <button @click="updateBookingStatus(booking.bookingId, 'completed')" class="complete-btn">
                Mark Complete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Service Modal -->
    <div v-if="showCreateModal || showEditModal" class="modal" @click.self="closeModal">
      <div class="modal-content">
        <h3>{{ showEditModal ? 'Edit Service' : 'Create Service' }}</h3>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>Category</label>
            <input v-model="serviceForm.category" type="text" required />
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea v-model="serviceForm.description" required rows="3"></textarea>
          </div>
          <div class="form-group">
            <label>Pricing (FCFA)</label>
            <input v-model.number="serviceForm.pricing" type="number" required min="0" />
          </div>
          <div class="form-group">
            <label>City</label>
            <input v-model="serviceForm.city" type="text" required />
          </div>
          <div class="form-group">
            <label>District</label>
            <input v-model="serviceForm.district" type="text" required />
          </div>
          <div class="form-group">
            <label>Working Days</label>
            <div class="days-checkboxes">
              <label v-for="day in daysOfWeek" :key="day">
                <input type="checkbox" :value="day" v-model="serviceForm.workingDays" />
                {{ day }}
              </label>
            </div>
          </div>
          <div class="form-group">
            <label>Start Time</label>
            <input v-model="serviceForm.startTime" type="time" required />
          </div>
          <div class="form-group">
            <label>End Time</label>
            <input v-model="serviceForm.endTime" type="time" required />
          </div>
          <p v-if="formError" class="error">{{ formError }}</p>
          <div class="modal-actions">
            <button type="button" @click="closeModal" class="cancel-btn-modal">Cancel</button>
            <button type="submit" :disabled="formLoading" class="submit-btn">
              {{ formLoading ? 'Saving...' : 'Save' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import apolloClient from '../apollo'
import gql from 'graphql-tag'

const GET_MY_SERVICES = gql`
  query GetServices {
    services {
      serviceId
      providerId
      category
      description
      pricing
      location { city district }
      averageRating
    }
  }
`

const GET_PROVIDER_BOOKINGS = gql`
  query GetAllBookings {
    services {
      serviceId
      providerId
    }
  }
`

const CREATE_SERVICE = gql`
  mutation CreateService($input: ServiceInput!) {
    createService(input: $input) {
      serviceId
    }
  }
`

const UPDATE_SERVICE = gql`
  mutation UpdateService($id: ID!, $input: ServiceInput!) {
    updateService(id: $id, input: $input) {
      serviceId
    }
  }
`

const DELETE_SERVICE = gql`
  mutation DeleteService($id: ID!) {
    deleteService(id: $id)
  }
`

const UPDATE_BOOKING_STATUS = gql`
  mutation UpdateBookingStatus($id: ID!, $status: String!) {
    updateBookingStatus(id: $id, status: $status) {
      bookingId
    }
  }
`

export default {
  name: 'Dashboard',
  setup() {
    const router = useRouter()
    const services = ref([])
    const providerBookings = ref([])
    const loading = ref(true)
    const bookingsLoading = ref(true)
    const error = ref('')
    const showCreateModal = ref(false)
    const showEditModal = ref(false)
    const editingServiceId = ref(null)
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    const serviceForm = ref({
      category: '',
      description: '',
      pricing: 0,
      city: '',
      district: '',
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      startTime: '09:00',
      endTime: '17:00'
    })
    const formLoading = ref(false)
    const formError = ref('')

    const user = JSON.parse(localStorage.getItem('user'))

    const fetchServices = async () => {
      try {
        const { data } = await apolloClient.query({
          query: GET_MY_SERVICES,
          fetchPolicy: 'network-only'
        })
        services.value = data.services.filter(s => s.providerId === user.userId)
      } catch (err) {
        error.value = err.message
      } finally {
        loading.value = false
      }
    }

    const fetchProviderBookings = async () => {
      try {
        const { data } = await apolloClient.query({
          query: gql`
        query {
          bookingsByProvider(providerId: "${user.userId}") {
            bookingId
            serviceId
            date
            status
            totalCost
            paymentMethod
            paymentStatus
            paymentDate
            customer {
              name
              phone
            }
            service {
              category
            }
          }
        }
      `,
          fetchPolicy: 'network-only'
        })
        providerBookings.value = data.bookingsByProvider
      } catch (err) {
        console.error(err)
      } finally {
        bookingsLoading.value = false
      }
    }

    const editService = (service) => {
      editingServiceId.value = service.serviceId
      serviceForm.value = {
        category: service.category,
        description: service.description,
        pricing: service.pricing,
        city: service.location.city,
        district: service.location.district,
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        startTime: '09:00',
        endTime: '17:00'
      }
      showEditModal.value = true
    }

    const handleSubmit = async () => {
      formLoading.value = true
      formError.value = ''

      const availability = serviceForm.value.workingDays.map(day => ({
        dayOfWeek: day,
        startTime: serviceForm.value.startTime,
        endTime: serviceForm.value.endTime
      }))

      const input = {
        providerId: user.userId,
        category: serviceForm.value.category,
        description: serviceForm.value.description,
        pricing: serviceForm.value.pricing,
        availability,
        location: {
          city: serviceForm.value.city,
          district: serviceForm.value.district
        }
      }

      try {
        if (showEditModal.value) {
          await apolloClient.mutate({
            mutation: UPDATE_SERVICE,
            variables: { id: editingServiceId.value, input }
          })
        } else {
          await apolloClient.mutate({
            mutation: CREATE_SERVICE,
            variables: { input }
          })
        }
        closeModal()
        fetchServices()
      } catch (err) {
        formError.value = err.message
      } finally {
        formLoading.value = false
      }
    }

    const deleteServiceConfirm = async (id) => {
      if (confirm('Delete this service?')) {
        try {
          await apolloClient.mutate({
            mutation: DELETE_SERVICE,
            variables: { id }
          })
          fetchServices()
        } catch (err) {
          alert(err.message)
        }
      }
    }

    const updateBookingStatus = async (id, status) => {
      try {
        await apolloClient.mutate({
          mutation: UPDATE_BOOKING_STATUS,
          variables: { id, status }
        })
        fetchProviderBookings()
      } catch (err) {
        alert(err.message)
      }
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleString()
    }

    const formatPayment = (method) => {
      const methods = {
        cash: 'Cash',
        orange: 'Orange Money',
        mtn: 'MTN Mobile Money',
        moov: 'Moov Money'
      }
      return methods[method] || method
    }

    const closeModal = () => {
      showCreateModal.value = false
      showEditModal.value = false
      editingServiceId.value = null
      serviceForm.value = {
        category: '',
        description: '',
        pricing: 0,
        city: '',
        district: '',
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        startTime: '09:00',
        endTime: '17:00'
      }
      formError.value = ''
    }

    const handleLogout = () => {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push('/login')
    }

    onMounted(() => {
      if (user.userType !== 'provider') {
        router.push('/services')
      } else {
        fetchServices()
        fetchProviderBookings()
      }
    })

    return {
      services,
      providerBookings,
      loading,
      bookingsLoading,
      error,
      showCreateModal,
      showEditModal,
      serviceForm,
      formLoading,
      formError,
      daysOfWeek,
      editService,
      handleSubmit,
      deleteServiceConfirm,
      updateBookingStatus,
      formatDate,
      formatPayment,
      closeModal,
      handleLogout
    }
  }
}
</script>

<style scoped>
.dashboard-container {
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

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.create-btn {
  padding: 10px 20px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.service-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.service-card h3 {
  color: #007bff;
  margin-bottom: 10px;
}

.description {
  color: #666;
  margin-bottom: 10px;
}

.price {
  font-size: 20px;
  font-weight: bold;
  color: #28a745;
  margin-bottom: 10px;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.edit-btn {
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.delete-btn {
  padding: 8px 16px;
  background-color: #dc3545;
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
  max-height: 90vh;
  overflow-y: auto;
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
  margin-top: 20px;
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

.loading, .error, .no-data {
  text-align: center;
  padding: 40px;
}

.bookings-section {
  margin-top: 60px;
  padding-top: 40px;
  border-top: 2px solid #e0e0e0;
}

.bookings-section h2 {
  margin-bottom: 30px;
}

.bookings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
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

.booking-card h4 {
  margin: 0;
  color: #007bff;
}

.booking-card p {
  margin: 8px 0;
  font-size: 14px;
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

.booking-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}

.confirm-btn {
  flex: 1;
  padding: 8px 16px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.complete-btn {
  flex: 1;
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.days-checkboxes {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.days-checkboxes label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: normal;
}

.cancel-btn-modal {
  padding: 10px 20px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>