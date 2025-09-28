<template>
  <div class="home">
    <AppHeader />
    <main>
      <h1>Welcome to the Pressing Manager</h1>
      <p>Manage your stores and items efficiently.</p>
      <router-link to="/stores" class="btn">View My Stores</router-link>
      <router-link to="/stats" class="btn">View Stats</router-link>
    </main>
    <AppFooter />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import AppHeader from '../components/layout/AppHeader.vue';
import AppFooter from '../components/layout/AppFooter.vue';

export default defineComponent({
  components: {
    AppHeader,
    AppFooter
  }
});
</script>

<style scoped>
.home {
  text-align: center;
  padding: 20px;
}

.btn {
  display: inline-block;
  margin: 10px;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 5px;
}

.btn:hover {
  background-color: #0056b3;
}
</style>