<contents of /pressing-manager-frontend/src/components/stores/StoreList.vue>

<template>
  <div>
    <h1>Your Stores</h1>
    <LoadingWrapper v-if="loading" />
    <div v-else>
      <div v-if="stores.length === 0">
        <p>No stores associated with your account.</p>
      </div>
      <div v-else>
        <StoreCard
          v-for="store in stores"
          :key="store.id"
          :store="store"
          @click="viewStore(store.id)"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useStores } from '@/composables/useStores';
import LoadingWrapper from '@/components/common/LoadingWrapper.vue';
import StoreCard from './StoreCard.vue';

export default defineComponent({
  components: {
    LoadingWrapper,
    StoreCard,
  },
  setup() {
    const { fetchStores, stores } = useStores();
    const loading = ref(true);

    onMounted(async () => {
      await fetchStores();
      loading.value = false;
    });

    const viewStore = (id: string) => {
      // Logic to navigate to the store detail view
    };

    return {
      stores,
      loading,
      viewStore,
    };
  },
});
</script>

<style scoped>
/* Add any specific styles for the StoreList component here */
</style>