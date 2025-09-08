<template>
  <a-layout-footer class="footer">
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

<script setup lang="ts">
import { HomeOutlined, PlusCircleOutlined, SearchOutlined } from '@ant-design/icons-vue'
</script>

<style scoped>
.footer {
  position: fixed;
  bottom: 0;
  width: 100%;
  background-color: #fff;
  padding: 0;
  z-index: 1000;
  border-top: 1px solid #f0f0f0;
}
.tabs { display: flex; justify-content: space-around; height: 56px; }
.tab { display: flex; flex-direction: column; align-items: center; justify-content: center; flex-grow: 1; color: #888; text-decoration: none; font-size: 12px; }
.tab .anticon { font-size: 20px; margin-bottom: 4px; }
.tab.active { color: #1677ff; }
</style>
