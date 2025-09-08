<template>
  <a-layout style="min-height: 100vh">
    <div v-if="authStore.loading" class="loading-container">
      <a-spin size="large" />
      <div style="margin-top: 16px;">Chargement...</div>
    </div>

    <!-- Only show header and footer if authenticated -->
    <template v-else>
  <AppHeader v-if="authStore.isAuthenticated" :title="currentTitle" @menu="onMenuClick" />

      <a-layout-content :style="contentStyle">
        <router-view />
      </a-layout-content>

  <AppFooter v-if="authStore.isAuthenticated" />
    </template>
  </a-layout>
</template>

<script setup lang="ts">
import { computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from './store/auth'
import { initializeTypes } from './store/types'
import AppHeader from './components/layout/AppHeader.vue'
import AppFooter from './components/layout/AppFooter.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const currentTitle = computed(() => (route.meta?.title as string) || 'Pressing Manager')

// No header search; each view owns its search UI

const contentStyle = computed(() => {
  if (!authStore.isAuthenticated) {
    return { padding: '16px' }
  }
  return {
    marginTop: '64px',
    marginBottom: '72px',
    padding: '16px',
    overflowY: 'auto'
  }
})

function onMenuClick(key: string) {
  if (key === 'logout') {
    handleLogout()
  } else if (key !== route.path) {
    router.push(key)
  }
}

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}

onMounted(async () => {
  console.log('App.vue mounted, initializing auth...')
  console.log('Firebase config check:', {
    apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY ? 'Present' : 'Missing',
    projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID ? 'Present' : 'Missing',
  })

  try {
    await authStore.initAuth()
    console.log('Auth initialized successfully')

    // Initialize types store after auth is ready
    initializeTypes()
    console.log('Types store initialized')
  } catch (error) {
    console.error('Auth initialization error:', error)
  }

  // Handle redirect result (for Google Sign-In on mobile)
  try {
    if (typeof authStore.handleAuthRedirectResult === 'function') {
      await authStore.handleAuthRedirectResult()
    }
  } catch (error) {
    console.error('Redirect result handling error:', error)
  }
})

watch(() => route.meta?.title as string | undefined, (title) => {
  if (title) document.title = `${title} - Pressing Manager`
  else document.title = 'Pressing Manager'
}, { immediate: true })
</script>

<style>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  color: #666;
  font-size: 16px;
}

body {
  margin: 0;
  font-family: 'Inter', 'Segoe UI', 'Arial', sans-serif;
  background-color: #f0f2f5;
}

.header {
  background-color: #001529;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 10;
  height: 64px;
}

.header-left {
  flex-shrink: 0;
}

.header-center {
  flex: 1;
  max-width: 600px;
  margin: 0 20px;
}

.header-right {
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    height: auto;
    padding: 12px 20px;
    align-items: stretch;
  }
  
  .header-left {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  
  .header-right {
    position: absolute;
    top: 12px;
    right: 20px;
    z-index: 1001;
  }
  
  .header-center {
    width: 100%;
    max-width: none;
    margin: 0;
  }
  
  .ant-layout-content {
    margin-top: 100px !important; /* Adjust for taller header on mobile */
  }
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: white;
}

.footer {
  position: fixed;
  bottom: 0;
  width: 100%;
  background-color: #fff;
  padding: 0;
  z-index: 10;
  border-top: 1px solid #f0f0f0;
}

.tabs {
  display: flex;
  justify-content: space-around;
  height: 56px;
}

.tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  color: #888;
  text-decoration: none;
  font-size: 12px;
}

.tab .anticon {
  font-size: 20px;
  margin-bottom: 4px;
}

.tab.active {
  color: #1677ff;
}

.ant-layout-content {
  overflow-y: auto;
}

/* Ensure dropdown is visible on mobile */
@media (max-width: 768px) {
  .ant-dropdown {
    z-index: 1050 !important;
  }
  
  .ant-dropdown-menu {
    z-index: 1050 !important;
    position: absolute !important;
    right: 0 !important;
    top: 40px !important;
    min-width: 200px;
  }
  
  /* Make menu button more clickable on mobile */
  .header-right .ant-dropdown-link {
    padding: 8px;
    display: block;
    border-radius: 4px;
  }
  
  .header-right .ant-dropdown-link:hover {
    background: rgba(255, 255, 255, 0.1);
  }
}
</style>
