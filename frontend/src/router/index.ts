import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../store/auth'

import Home from '../views/Home.vue'
import ItemRegister from '../views/ItemRegister.vue'
import Register from '../views/Register.vue'
import Item from '../views/Item.vue'
import Pending from '../views/Pending.vue'
import Deadlines from '../views/Deadlines.vue'
import Stats from '../views/Stats.vue'
import Types from '../views/Types.vue'
import Login from '../views/Login.vue'

const routes = [
  { path: '/login', component: Login, meta: { title: 'Connexion', requiresGuest: true } },
  { path: '/register', component: Register, meta: { title: 'Inscription', requiresGuest: true } },
  { path: '/', component: Home, meta: { title: 'Accueil', requiresAuth: true } },
  { path: '/item-register', component: ItemRegister, meta: { title: 'Enregistrer', requiresAuth: true } },
  { path: '/item', component: Item, meta: { title: 'Rechercher', requiresAuth: true } },
  { path: '/pending', component: Pending, meta: { title: 'En attente', requiresAuth: true } },
  { path: '/deadlines', component: Deadlines, meta: { title: 'Délais', requiresAuth: true } },
  { path: '/stats', component: Stats, meta: { title: 'Statistiques', requiresAuth: true } },
  { path: '/types', component: Types, meta: { title: 'Types', requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Route guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Initialize auth if needed
  if (authStore.loading) {
    await authStore.initAuth()
  }
  
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)
  
  if (requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (requiresGuest && authStore.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router
