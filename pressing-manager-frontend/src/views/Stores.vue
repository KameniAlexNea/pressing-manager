<template>
  <div>
    <h1>Your Stores</h1>
    <LoadingWrapper v-if="loading" />
    <div v-else>
      <StoreList :stores="stores" />
      <div v-if="stores.length === 0">
        <p>No stores associated with your account.</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useStores } from '../composables/useStores';
import LoadingWrapper from '../components/common/LoadingWrapper.vue';
import StoreList from '../components/stores/StoreList.vue';

export default defineComponent({
  components: {
    LoadingWrapper,
    StoreList,
  },
  setup() {
    const { fetchUserStores } = useStores();
    const stores = ref([]);
    const loading = ref(true);

    onMounted(async () => {
      try {
        stores.value = await fetchUserStores();
      } catch (error) {
        console.error('Error fetching stores:', error);
      } finally {
        loading.value = false;
      }
    });

    return {
      stores,
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