import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Register from '../views/Register.vue'
import Item from '../views/Item.vue'
import Pending from '../views/Pending.vue'
import Owner from '../views/Owner.vue'
import Deadlines from '../views/Deadlines.vue'
import Stats from '../views/Stats.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/register', component: Register },
  { path: '/item', component: Item },
  { path: '/pending', component: Pending },
  { path: '/owner', component: Owner },
  { path: '/deadlines', component: Deadlines },
  { path: '/stats', component: Stats },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
