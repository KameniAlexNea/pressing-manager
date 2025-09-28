<template>
  <div class="stats">
    <h1>Statistics</h1>
    <div v-if="loading" class="loading">
      <LoadingWrapper />
    </div>
    <div v-else>
      <h2>Total Stores: {{ stats.total_stores }}</h2>
      <h2>Total Items: {{ stats.total_items }}</h2>
      <h2>Received Items: {{ stats.received_items }}</h2>
      <h2>Cleaned Items: {{ stats.cleaned_items }}</h2>
      <h2>Delivered Items: {{ stats.delivered_items }}</h2>
      <h2>Pending Items: {{ stats.pending_items }}</h2>
      <h2>Total Revenue: {{ stats.total_revenue | currency }}</h2>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useStores } from '../composables/useStores';
import LoadingWrapper from '../components/common/LoadingWrapper.vue';

export default defineComponent({
  components: {
    LoadingWrapper,
  },
  setup() {
    const { getStats } = useStores();
    const stats = ref({
      total_stores: 0,
      total_items: 0,
      received_items: 0,
      cleaned_items: 0,
      delivered_items: 0,
      pending_items: 0,
      total_revenue: 0,
    });
    const loading = ref(true);

    onMounted(async () => {
      try {
        stats.value = await getStats();
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        loading.value = false;
      }
    });

    return {
      stats,
      loading,
    };
  },
});
</script>

<style scoped>
.stats {
  padding: 20px;
}
.loading {
  text-align: center;
}
</style>