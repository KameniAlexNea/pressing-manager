<template>
  <footer class="app-footer">
    <div class="footer-content">
      <p>&copy; {{ currentYear }} Pressing Manager. All rights reserved.</p>
      <nav>
        <router-link to="/">Home</router-link>
        <router-link to="/stores">Stores</router-link>
        <router-link to="/about">About</router-link>
        <router-link to="/contact">Contact</router-link>
      </nav>
    </div>
  </footer>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'AppFooter',
  data() {
    return {
      currentYear: new Date().getFullYear(),
    };
  },
});
</script>

<style scoped>
.app-footer {
  background-color: #f8f9fa;
  padding: 1rem;
  text-align: center;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

nav {
  display: flex;
  gap: 1rem;
}
</style>