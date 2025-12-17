<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2>Register</h2>
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <input v-model="form.name" type="text" placeholder="Full Name" required />
        </div>
        <div class="form-group">
          <input v-model="form.email" type="email" placeholder="Email" required />
        </div>
        <div class="form-group">
          <input v-model="form.password" type="password" placeholder="Password" required />
        </div>
        <div class="form-group">
          <input v-model="form.phone" type="tel" placeholder="Phone Number" required />
        </div>
        <div class="form-group">
          <select v-model="form.userType">
            <option value="customer">Customer</option>
            <option value="provider">Provider</option>
          </select>
        </div>
        <div class="form-group">
          <input v-model="form.city" type="text" placeholder="City" required />
        </div>
        <div class="form-group">
          <input v-model="form.district" type="text" placeholder="District" required />
        </div>
        <p v-if="error" class="error">{{ error }}</p>
        <button type="submit" :disabled="loading">
          {{ loading ? 'Loading...' : 'Register' }}
        </button>
      </form>
      <p class="link-text">
        Already have an account? <router-link to="/login">Login</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import apolloClient from '../apollo'
import { REGISTER } from '../graphql/queries'

export default {
  name: 'Register',
  setup() {
    const router = useRouter()
    const form = ref({
      name: '',
      email: '',
      password: '',
      phone: '',
      userType: 'customer',
      city: '',
      district: ''
    })
    const loading = ref(false)
    const error = ref('')

    const handleRegister = async () => {
      loading.value = true
      error.value = ''

      try {
        const { data } = await apolloClient.mutate({
          mutation: REGISTER,
          variables: {
            input: {
              name: form.value.name,
              email: form.value.email,
              password: form.value.password,
              phone: form.value.phone,
              userType: form.value.userType,
              location: {
                city: form.value.city,
                district: form.value.district
              }
            }
          }
        })

        localStorage.setItem('token', data.register.token)
        localStorage.setItem('user', JSON.stringify(data.register.user))
        
        router.push('/services')
      } catch (err) {
        error.value = err.message
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      loading,
      error,
      handleRegister
    }
  }
}
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

.auth-card {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 400px;
}

.auth-card h2 {
  margin-bottom: 30px;
  text-align: center;
  color: #333;
}

.form-group {
  margin-bottom: 15px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #28a745;
}

button {
  width: 100%;
  padding: 12px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}

button:hover {
  background-color: #218838;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.error {
  color: red;
  font-size: 14px;
  margin-bottom: 15px;
}

.link-text {
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
}

.link-text a {
  color: #007bff;
  text-decoration: none;
}
</style>
