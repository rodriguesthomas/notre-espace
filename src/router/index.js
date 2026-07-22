import { createRouter, createWebHistory } from 'vue-router'

// Importe tes composants/vues selon la structure de ton projet
import Home from '../views/Home.vue' // ou ton composant principal
import Login from '../views/Login.vue' // ou ta page de connexion

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/home',
    name: 'Home',
    component: Home
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 🛑 Protection contre la boucle d'écran noir
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'

  // 1. Si déjà connecté et qu'on essaie d'aller sur la page de connexion -> Redirige vers /home
  if (to.path === '/login' && isAuthenticated) {
    return next('/home')
  }

  // 2. Si PAS connecté et qu'on veut aller sur une page protégée -> Redirige vers /login
  if (to.path !== '/login' && !isAuthenticated) {
    return next('/login')
  }

  // 3. Dans tous les autres cas -> Laisse passer la navigation
  next()
})

export default router