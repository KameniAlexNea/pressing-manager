<template>
  <a-layout style="min-height: 100vh">
    <div v-if="authStore.loading" class="loading-container">
      <a-spin size="large" />
      <div style="margin-top: 16px;">Chargement...</div>
    </div>

    <!-- Only show header and footer if authenticated -->
    <template v-else>
      <a-layout-header v-if="authStore.isAuthenticated" class="header">
        <div class="header-left">
          <div class="title">{{ currentTitle }}</div>
        </div>
        
        <div class="header-center" v-if="showSearchBar">
          <GlobalSearch
            ref="globalSearchRef"
            @search="handleGlobalSearch"
            @clear="handleSearchClear"
          />
        </div>
        
        <div class="header-right">
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
        </div>
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
import { computed, watch, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from './store/auth'
import { useItemsStore } from './store/itemsStore'
import { initializeTypes } from './store/types'
import GlobalSearch from './components/common/GlobalSearch.vue'
import type { SearchFilters } from './components/common/GlobalSearch.vue'
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
const itemsStore = useItemsStore()
const globalSearchRef = ref()

const currentTitle = computed(() => (route.meta?.title as string) || 'Pressing Manager')

// Show search bar only on certain pages
const showSearchBar = computed(() => {
  const searchablePages = ['/', '/pending', '/owner', '/deadlines', '/stats']
  return searchablePages.includes(route.path)
})

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

function handleGlobalSearch(filters: SearchFilters) {
  console.log('Global search triggered:', filters)
  if (globalSearchRef.value) {
    globalSearchRef.value.setLoading(true)
  }
  
  // Convert Dayjs dates to strings for the store
  const storeFilters = {
    ...filters,
    dateReceivedFrom: filters.dateReceivedFrom?.toISOString() || null,
    dateReceivedTo: filters.dateReceivedTo?.toISOString() || null,
    datePromisedFrom: filters.datePromisedFrom?.toISOString() || null,
    datePromisedTo: filters.datePromisedTo?.toISOString() || null,
  }
  
  // Apply filters to items store
  itemsStore.setSearchFilters(storeFilters)
  
  // Navigate to appropriate page based on current route
  if (route.path === '/') {
    // If on home page, navigate to pending to show filtered results
    router.push('/pending')
  }
  
  setTimeout(() => {
    if (globalSearchRef.value) {
      globalSearchRef.value.setLoading(false)
    }
  }, 500)
}

function handleSearchClear() {
  console.log('Search cleared')
  itemsStore.clearFilters()
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
    gap: 12px;
  }
  
  .header-center {
    width: 100%;
    max-width: none;
    margin: 0;
  }
  
  .ant-layout-content {
    margin-top: 120px !important; /* Adjust for taller header on mobile */
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
</style>
