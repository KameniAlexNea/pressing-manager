<template>
  <a-layout style="min-height: 100vh">
    <!-- Show loading spinner while auth iimport { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from './store/auth'
import { initializeTypes } from './store/types'
import {nitializing -->
    <div v-if="authStore.loading" class="loading-container">
      <a-spin size="large" />
      <div style="margin-top: 16px;">Chargement...</div>
    </div>
    
    <!-- Only show header and footer if authenticated -->
    <template v-else>
      <a-layout-header v-if="authStore.isAuthenticated" class="header">
        <div class="title">{{ currentTitle }}</div>
        <a-dropdown>
          <a class="ant-dropdown-link" @click.prevent>
            <MenuOutlined style="font-size: 20px; color: #fff" />
          </a>
          <template #overlay>
            <a-menu @click="onMenuClick">
              <a-menu-item key="/deadlines">
                <template #icon>
                  <CalendarOutlined />
                </template>
                Délais
              </a-menu-item>
              <a-menu-item key="/stats">
                <template #icon>
                  <BarChartOutlined />
                </template>
                Statistiques
              </a-menu-item>
              <a-menu-item key="/storage">
                <template #icon>
                  <DatabaseOutlined />
                </template>
                Sauvegarde
              </a-menu-item>
              <a-menu-item key="/types">
                <template #icon>
                  <DatabaseOutlined />
                </template>
                Types
              </a-menu-item>
              <a-menu-item key="/owner">
                <template #icon>
                  <UserOutlined />
                </template>
                Par propriétaire
              </a-menu-item>
              <a-menu-item key="/pending">
                <template #icon>
                  <ClockCircleOutlined />
                </template>
                En attente
              </a-menu-item>
              <a-menu-divider />
              <a-menu-item key="logout" @click="handleLogout">
                <template #icon>
                  <LogoutOutlined />
                </template>
                Déconnexion
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </a-layout-header>
      
      <a-layout-content :style="contentStyle">
        <router-view />
      </a-layout-content>
      
      <a-layout-footer v-if="authStore.isAuthenticated" class="footer">
        <div class="tabs">
          <router-link to="/" class="tab" active-class="active">
            <HomeOutlined />
            <span>Accueil</span>
          </router-link>
          <router-link to="/item-register" class="tab" active-class="active">
            <PlusCircleOutlined />
            <span>Enregistrer</span>
          </router-link>
          <router-link to="/item" class="tab" active-class="active">
            <SearchOutlined />
            <span>Article</span>
          </router-link>
        </div>
      </a-layout-footer>
    </template>
  </a-layout>
</template>

<script setup lang="ts">
import { computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from './store/auth'
import { initializeTypes } from './store/types'
import {
  HomeOutlined,
  PlusCircleOutlined,
  SearchOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  BarChartOutlined,
  DatabaseOutlined,
  MenuOutlined,
  LogoutOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const currentTitle = computed(() => (route.meta?.title as string) || 'Pressing Manager')

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

function onMenuClick({ key }: { key: string }) {
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
}

.title {
  font-size: 18px;
  font-weight: 600;
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
</style>
