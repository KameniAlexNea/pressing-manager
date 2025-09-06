<template>
  <a-layout style="min-height: 100vh">
    <a-layout-header class="header">
      <div class="title">{{ currentTitle }}</div>
      <a-dropdown>
        <a class="ant-dropdown-link" @click.prevent>
          <MenuOutlined style="font-size: 20px; color: #fff" />
        </a>
        <template #overlay>
          <a-menu @click="onMenuClick">
            <a-menu-item key="/deadlines">
              <template #icon><CalendarOutlined /></template>
              Délais
            </a-menu-item>
            <a-menu-item key="/stats">
              <template #icon><BarChartOutlined /></template>
              Statistiques
            </a-menu-item>
            <a-menu-item key="/storage">
              <template #icon><DatabaseOutlined /></template>
              Sauvegarde
            </a-menu-item>
            <a-menu-item key="/types">
              <template #icon><DatabaseOutlined /></template>
              Types
            </a-menu-item>
             <a-menu-item key="/owner">
              <template #icon><UserOutlined /></template>
              Par propriétaire
            </a-menu-item>
            <a-menu-item key="/pending">
              <template #icon><ClockCircleOutlined /></template>
              En attente
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </a-layout-header>
    <a-layout-content style="padding: 16px; margin-bottom: 56px;">
      <router-view />
    </a-layout-content>
    <a-layout-footer class="footer">
      <div class="tabs">
        <router-link to="/" class="tab" active-class="active">
          <HomeOutlined />
          <span>Accueil</span>
        </router-link>
        <router-link to="/register" class="tab" active-class="active">
          <PlusCircleOutlined />
          <span>Enregistrer</span>
        </router-link>
        <router-link to="/item" class="tab" active-class="active">
          <SearchOutlined />
          <span>Article</span>
        </router-link>
      </div>
    </a-layout-footer>
  </a-layout>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  HomeOutlined, 
  PlusCircleOutlined, 
  SearchOutlined, 
  ClockCircleOutlined, 
  UserOutlined, 
  CalendarOutlined, 
  BarChartOutlined, 
  DatabaseOutlined,
  MenuOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()

const currentTitle = computed(() => (route.meta?.title as string) || 'Pressing Manager')

function onMenuClick({ key }: { key: string }) {
  if (key !== route.path) router.push(key)
}

watch(() => route.meta?.title as string | undefined, (title) => {
  if (title) document.title = `${title} - Pressing Manager`
  else document.title = 'Pressing Manager'
}, { immediate: true })
</script>

<style>
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
  margin-top: 64px; /* Height of header */
  margin-bottom: 56px; /* Height of footer */
  padding: 16px;
  overflow-y: auto;
}
</style>

