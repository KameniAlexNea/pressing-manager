<template>
  <a-layout style="min-height: 100vh">
    <a-layout-sider :collapsible="true" v-model:collapsed="collapsed" breakpoint="lg">
      <div class="logo">PM</div>
      <a-menu theme="dark" mode="inline" :selectedKeys="[selectedKey]" @click="onMenuClick">
        <a-menu-item key="/">
          <template #icon><HomeOutlined /></template>
          Accueil
        </a-menu-item>
        <a-menu-item key="/register">
          <template #icon><PlusCircleOutlined /></template>
          Enregistrer
        </a-menu-item>
        <a-menu-item key="/item">
          <template #icon><SearchOutlined /></template>
          Article
        </a-menu-item>
        <a-menu-item key="/pending">
          <template #icon><ClockCircleOutlined /></template>
          En attente
        </a-menu-item>
        <a-menu-item key="/owner">
          <template #icon><UserOutlined /></template>
          Par propriétaire
        </a-menu-item>
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
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header class="site-header">
        <div class="title">Pressing Manager</div>
      </a-layout-header>
      <a-layout-content style="margin: 16px">
        <a-breadcrumb style="margin-bottom: 12px">
          <a-breadcrumb-item v-for="(c, idx) in crumbs" :key="idx">{{ c }}</a-breadcrumb-item>
        </a-breadcrumb>
        <div class="site-content">
          <router-view />
        </div>
      </a-layout-content>
    </a-layout>
  </a-layout>
  
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { HomeOutlined, PlusCircleOutlined, SearchOutlined, ClockCircleOutlined, UserOutlined, CalendarOutlined, BarChartOutlined, DatabaseOutlined } from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()
const collapsed = ref(false)

const selectedKey = computed(() => route.path)
const crumbs = computed(() => route.path.split('/').filter(Boolean).map(s => s.charAt(0).toUpperCase() + s.slice(1)) || ['Accueil'])

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
}
.logo {
  height: 32px;
  margin: 16px;
  background: rgba(255,255,255,0.2);
  color:#fff;
  display:flex;
  align-items:center;
  justify-content:center;
  font-weight:700;
  border-radius:4px;
}
.site-header {
  background: #2a3f5f;
  padding: 0 16px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(42,63,95,0.08);
}
.title {
  font-weight: 700;
  color: #fff;
  letter-spacing: 1px;
  text-shadow: 0 1px 4px rgba(0,0,0,0.12);
  font-family: 'Inter', 'Segoe UI', 'Arial', sans-serif;
}
.site-content {
  color: #1a2233;
  background: #fff;
  padding: 16px;
  min-height: calc(100vh - 160px);
  border-radius: 8px;
}
</style>
