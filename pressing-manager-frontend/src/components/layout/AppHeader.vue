<template>
  <header class="app-header">
    <nav>
      <router-link to="/">Home</router-link>
      <router-link to="/stores">Stores</router-link>
      <router-link to="/items">Items</router-link>
      <router-link to="/login">Login</router-link>
      <router-link to="/register">Register</router-link>
    </nav>
    <div class="user-info">
      <span v-if="user">{{ user.email }}</span>
      <button v-if="user" @click="logout">Logout</button>
    </div>
  </header>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useAuthStore } from '@/store/auth';

export default defineComponent({
  setup() {
    const authStore = useAuthStore();
    const user = authStore.user;

    const logout = () => {
      authStore.logout();
    };

    return { user, logout };
  }
});
</script>

<style scoped>
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #f8f9fa;
}

nav {
  display: flex;
  gap: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
}
</style>