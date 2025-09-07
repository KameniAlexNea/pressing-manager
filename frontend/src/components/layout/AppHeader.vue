<template>
  <a-layout-header class="header">
    <div class="header-left">
      <div class="title">{{ title }}</div>
    </div>

    <div class="header-right">
      <a-dropdown :trigger="['click']" placement="bottomRight">
        <a-button type="text" class="menu-button" aria-label="Menu">
          <MenuOutlined style="font-size: 20px; color: #fff" />
        </a-button>
        <template #overlay>
          <a-menu @click="onMenuClick">
            <a-menu-item key="/deadlines"><CalendarOutlined /> Délais</a-menu-item>
            <a-menu-item key="/stats"><BarChartOutlined /> Statistiques</a-menu-item>
            <a-menu-item key="/types"><DatabaseOutlined /> Types</a-menu-item>
            <a-menu-item key="/pending"><ClockCircleOutlined /> En attente</a-menu-item>
            <a-menu-divider />
            <a-menu-item key="logout"><LogoutOutlined /> Déconnexion</a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>
  </a-layout-header>
</template>

<script setup lang="ts">
import {
  MenuOutlined,
  CalendarOutlined,
  BarChartOutlined,
  DatabaseOutlined,
  ClockCircleOutlined,
  LogoutOutlined,
} from '@ant-design/icons-vue'

defineProps<{ title: string }>()
const emit = defineEmits<{ (e: 'menu', key: string): void }>()

function onMenuClick(info: { key: string }) {
  emit('menu', info.key)
}
</script>

<style scoped>
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
  z-index: 1000;
  height: 64px;
}
.title {
  font-size: 18px;
  font-weight: 600;
  color: white;
}
.menu-button {
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
  padding: 8px !important;
  height: auto !important;
}
@media (max-width: 768px) {
  .menu-button { min-width: 44px; min-height: 44px; }
}
</style>
