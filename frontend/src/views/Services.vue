<template>
  <div class="services-container">
    <nav class="navbar">
      <h1>Service Marketplace</h1>
      <div class="nav-links">
        <router-link to="/services" class="active">Services</router-link>
        <router-link to="/bookings">My Bookings</router-link>
        <router-link v-if="isProvider" to="/dashboard">Dashboard</router-link>
        <button @click="handleLogout" class="logout-btn">Logout</button>
      </div>
    </nav>

    <div class="content">
      <div class="header">
        <h2>Available Services</h2>
        <div class="filters">
          <input v-model="locationFilter" @input="fetchServices" placeholder="Search by city..." class="filter-input" />
          <select v-model="categoryFilter" @change="fetchServices" class="filter-select">
            <option value="">All Categories</option>
            <option v-for="cat in categories" :key="cat.categoryId" :value="cat.name">
              {{ cat.icon }} {{ cat.name }}
            </option>
          </select>
        </div>
      </div>
      
      <div v-if="loading" class="loading">Loading services...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else-if="services.length === 0" class="no-data">No services available</div>
      
      <div v-else class="services-grid">
        <div v-for="service in services" :key="service.serviceId" class="service-card" @click="viewService(service.serviceId)">
          <div class="service-header">
            <h3>{{ service.category }}</h3>
            <span class="rating">⭐ {{ service.averageRating.toFixed(1) }}</span>
          </div>
          <p class="description">{{ service.description }}</p>
          <div class="service-details">
            <p><strong>Price:</strong> {{ service.pricing }} FCFA</p>
            <p><strong>Location:</strong> {{ service.location.city }}, {{ service.location.district }}</p>
            <p><strong>Provider:</strong> {{ service.provider.name }}</p>
            <p><strong>Contact:</strong> {{ service.provider.phone }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import apolloClient from '../apollo'
import { GET_SERVICES } from '../graphql/queries'
import gql from 'graphql-tag'

const GET_CATEGORIES = gql`
  query GetCategories {
    categories { categoryId name icon }
  }
`

export default {
  name: 'Services',
  setup() {
    const router = useRouter()
    const services = ref([])
    const categories = ref([])
    const loading = ref(true)
    const error = ref('')
    const locationFilter = ref('')
    const categoryFilter = ref('')

    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const isProvider = computed(() => user.userType === 'provider')

    const fetchServices = async () => {
      try {
        const { data } = await apolloClient.query({
          query: GET_SERVICES,
          variables: {
            location: locationFilter.value || undefined,
            category: categoryFilter.value || undefined
          }
        })
        services.value = data.services
      } catch (err) {
        error.value = err.message
      } finally {
        loading.value = false
      }
    }

    const fetchCategories = async () => {
      try {
        const { data } = await apolloClient.query({ query: GET_CATEGORIES })
        categories.value = data.categories
      } catch (err) {
        console.error(err)
      }
    }

    const viewService = (id) => {
      router.push(`/service/${id}`)
    }

    const handleLogout = () => {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push('/login')
    }

    onMounted(() => {
      fetchServices()
      fetchCategories()
    })

    return {
      services,
      categories,
      loading,
      error,
      locationFilter,
      categoryFilter,
      isProvider,
      fetchServices,
      viewService,
      handleLogout
    }
  }
}
</script>

<style scoped>
.services-container {
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
  color: #333;
  font-size: 24px;
}

.logout-btn {
  padding: 8px 20px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.logout-btn:hover {
  background-color: #c82333;
}

.content {
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  margin-bottom: 30px;
}

.header h2 {
  margin-bottom: 20px;
}

.filters {
  display: flex;
  gap: 15px;
}

.filter-input,
.filter-select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.filter-input {
  flex: 1;
  max-width: 300px;
}

.filter-select {
  min-width: 200px;
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

.content h2 {
  margin-bottom: 30px;
  color: #333;
}

.loading, .error, .no-data {
  text-align: center;
  padding: 40px;
  font-size: 18px;
}

.error {
  color: red;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.service-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s;
  cursor: pointer;
}

.service-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.service-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.service-header h3 {
  margin: 0;
  color: #007bff;
}

.rating {
  font-size: 14px;
  font-weight: bold;
}

.description {
  color: #666;
  margin-bottom: 15px;
  line-height: 1.5;
}

.service-details p {
  margin: 8px 0;
  font-size: 14px;
  color: #333;
}
</style>
