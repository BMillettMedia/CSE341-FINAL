<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2>Authenticating...</h2>
      <p>Please wait while we log you in.</p>
    </div>
  </div>
</template>

<script>
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

export default {
  name: 'OAuthCallback',
  setup() {
    const router = useRouter()
    const route = useRoute()

    onMounted(() => {
      const token = route.query.token
      const user = route.query.user

      if (token && user) {
        localStorage.setItem('token', token)
        localStorage.setItem('user', decodeURIComponent(user))
        router.push('/services')
      } else {
        router.push('/login')
      }
    })
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
  text-align: center;
}
</style>