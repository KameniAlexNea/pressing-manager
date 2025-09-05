import { createRouter, createWebHistory } from 'vue-router'


import Home from '../views/Home.vue'
import Register from '../views/Register.vue'
import Item from '../views/Item.vue'
import Pending from '../views/Pending.vue'
import Owner from '../views/Owner.vue'
import Deadlines from '../views/Deadlines.vue'
import Stats from '../views/Stats.vue'
import Storage from '../views/Storage.vue'
import Types from '../views/Types.vue'


const routes = [
  { path: '/', component: Home, meta: { title: 'Accueil' } },
  { path: '/register', component: Register, meta: { title: 'Enregistrer' } },
  { path: '/item', component: Item, meta: { title: 'Article' } },
  { path: '/pending', component: Pending, meta: { title: 'En attente' } },
  { path: '/owner', component: Owner, meta: { title: 'Propriétaire' } },
  { path: '/deadlines', component: Deadlines, meta: { title: 'Délais' } },
  { path: '/stats', component: Stats, meta: { title: 'Statistiques' } },
  { path: '/storage', component: Storage, meta: { title: 'Sauvegarde' } },
  { path: '/types', component: Types, meta: { title: 'Types' } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
