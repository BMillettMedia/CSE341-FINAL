<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2>Login</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <input
            v-model="form.email"
            type="email"
            placeholder="Email"
            required
          />
        </div>
        <div class="form-group">
          <input
            v-model="form.password"
            type="password"
            placeholder="Password"
            required
          />
        </div>
        <p v-if="error" class="error">{{ error }}</p>
        <button type="submit" :disabled="loading">
          {{ loading ? 'Loading...' : 'Login' }}
        </button>
      </form>
      <p class="link-text">
        Don't have an account? <router-link to="/register">Register</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import apolloClient from '../apollo'
import { LOGIN } from '../graphql/queries'

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    const form = ref({
      email: '',
      password: ''
    })
    const loading = ref(false)
    const error = ref('')

    const handleLogin = async () => {
      loading.value = true
      error.value = ''

      try {
        const { data } = await apolloClient.mutate({
          mutation: LOGIN,
          variables: {
            input: {
              email: form.value.email,
              password: form.value.password
            }
          }
        })

        localStorage.setItem('token', data.login.token)
        localStorage.setItem('user', JSON.stringify(data.login.user))
        
        apolloClient.resetStore()
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
      handleLogin
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
  margin-bottom: 20px;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #007bff;
}

button {
  width: 100%;
  padding: 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
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

.link-text a:hover {
  text-decoration: underline;
}
</style>
