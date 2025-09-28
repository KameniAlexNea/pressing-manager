<Pending.vue>
<template>
  <div>
    <h1>Pending Items</h1>
    <LoadingWrapper v-if="loading" />
    <ItemList v-else :items="pendingItems" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useStores } from '../composables/useStores';
import LoadingWrapper from '../components/common/LoadingWrapper.vue';
import ItemList from '../components/items/ItemList.vue';

export default defineComponent({
  components: {
    LoadingWrapper,
    ItemList,
  },
  setup() {
    const { getPendingItems } = useStores();
    const pendingItems = ref([]);
    const loading = ref(true);

    onMounted(async () => {
      try {
        pendingItems.value = await getPendingItems();
      } catch (error) {
        console.error('Error fetching pending items:', error);
      } finally {
        loading.value = false;
      }
    });

    return {
      pendingItems,
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