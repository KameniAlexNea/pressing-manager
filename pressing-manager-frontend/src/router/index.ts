import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Stores from '../views/Stores.vue'
import Store from '../views/Store.vue'
import Item from '../views/Item.vue'
import ItemRegister from '../views/ItemRegister.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Deadlines from '../views/Deadlines.vue'
import Pending from '../views/Pending.vue'
import Stats from '../views/Stats.vue'
import Types from '../views/Types.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/stores', component: Stores },
  { path: '/stores/:id', component: Store },
  { path: '/items/:id', component: Item },
  { path: '/item/register', component: ItemRegister },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/deadlines', component: Deadlines },
  { path: '/pending', component: Pending },
  { path: '/stats', component: Stats },
  { path: '/types', component: Types },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router