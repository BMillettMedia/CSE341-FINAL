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
      <div class="divider">OR</div>

      <button @click="loginWithGoogle" type="button" class="google-btn">
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
        Continue with Google
      </button>

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
import { LOGIN } from '@/graphql/queries'

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
    const loginWithGoogle = () => {
      window.location.href = process.env.NODE_ENV === 'production'
          ? process.env.GOOGLE_CALLBACK_URL_PROD
          : process.env.GOOGLE_CALLBACK_URL_DEV
    }

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
      handleLogin,
      loginWithGoogle
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

.divider {
  text-align: center;
  margin: 20px 0;
  color: #999;
  position: relative;
}

.divider::before,
.divider::after {
  content: "";
  position: absolute;
  top: 50%;
  width: 45%;
  height: 1px;
  background: #ddd;
}

.divider::before {
  left: 0;
}

.divider::after {
  right: 0;
}

.google-btn {
  width: 100%;
  padding: 12px;
  background-color: white;
  color: #444;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}

.google-btn:hover {
  background-color: #f8f8f8;
}

.google-btn img {
  width: 20px;
  height: 20px;
}
</style>
