import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { initializeApp } from 'firebase/app'
import { firebaseConfig } from './firebase'

// Initialize Firebase
initializeApp(firebaseConfig)

// Create and mount the Vue application
createApp(App)
  .use(router)
  .mount('#app')