<template>
  <div>
    <h1>Deadlines</h1>
    <LoadingWrapper v-if="loading">
      <p>Loading deadlines...</p>
    </LoadingWrapper>
    <DeadlinesList v-else :deadlines="deadlines" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useStores } from '../composables/useStores';
import LoadingWrapper from '../components/common/LoadingWrapper.vue';
import DeadlinesList from '../components/items/DeadlinesList.vue';

export default defineComponent({
  components: {
    LoadingWrapper,
    DeadlinesList,
  },
  setup() {
    const { getDeadlines } = useStores();
    const deadlines = ref([]);
    const loading = ref(true);

    onMounted(async () => {
      try {
        deadlines.value = await getDeadlines();
      } catch (error) {
        console.error('Error fetching deadlines:', error);
      } finally {
        loading.value = false;
      }
    });

    return {
      deadlines,
      loading,
    };
  },
});
</script>

<style scoped>
h1 {
  margin-bottom: 20px;
}
</style>