import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueFire, VueFireAuth } from 'vuefire'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import App from './App.vue'
import router from './router'
import { auth } from './firebase'

const app = createApp(App)
app.use(createPinia())
app.use(VueFire, {
  firebaseApp: auth.app,
  modules: [
    VueFireAuth(),
  ],
})
app.use(router)
app.use(Antd)
app.mount('#app')
