<template>
  <div class="store-card">
    <h3 class="store-name">{{ store.name }}</h3>
    <p class="store-description">{{ store.description }}</p>
    <p class="store-owner">Owner: {{ store.owner }}</p>
    <p class="store-status">Status: {{ store.status }}</p>
    <router-link :to="{ name: 'StoreDetail', params: { id: store.id } }" class="view-details-button">
      View Details
    </router-link>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { Store } from '@/store/types';

export default defineComponent({
  name: 'StoreCard',
  props: {
    store: {
      type: Object as PropType<Store>,
      required: true
    }
  }
});
</script>

<style scoped>
.store-card {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  transition: box-shadow 0.3s;
}

.store-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.store-name {
  font-size: 1.5em;
  margin: 0;
}

.store-description {
  color: #666;
}

.store-owner,
.store-status {
  font-size: 0.9em;
  color: #999;
}

.view-details-button {
  display: inline-block;
  margin-top: 12px;
  padding: 8px 12px;
  background-color: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 4px;
}

.view-details-button:hover {
  background-color: #0056b3;
}
</style>