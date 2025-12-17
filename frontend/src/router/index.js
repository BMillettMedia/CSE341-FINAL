import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import OAuthCallback from '../views/OAuthCallback.vue'
import Services from '../views/Services.vue'
import ServiceDetail from '../views/ServiceDetail.vue'
import Bookings from '../views/Bookings.vue'
import Dashboard from '../views/Dashboard.vue'

const routes = [
    {
        path: '/',
        redirect: '/login'
    },
    {
        path: '/login',
        name: 'Login',
        component: Login
    },
    {
        path: '/register',
        name: 'Register',
        component: Register
    },
    {
        path: '/auth/callback',
        name: 'OAuthCallback',
        component: OAuthCallback
    },
    {
        path: '/services',
        name: 'Services',
        component: Services,
        meta: { requiresAuth: true }
    },
    {
        path: '/service/:id',
        name: 'ServiceDetail',
        component: ServiceDetail,
        meta: { requiresAuth: true }
    },
    {
        path: '/bookings',
        name: 'Bookings',
        component: Bookings,
        meta: { requiresAuth: true }
    },
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: { requiresAuth: true, requiresProvider: true }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token')

    if (to.meta.requiresAuth && !token) {
        next('/login')
    } else if ((to.path === '/login' || to.path === '/register') && token) {
        next('/services')
    } else {
        next()
    }
})

export default router
