<template>
  <div class="item-list">
    <h2>Items in Store</h2>
    <LoadingWrapper v-if="loading" />
    <div v-else>
      <div v-if="items.length === 0">
        <p>No items found for this store.</p>
      </div>
      <div v-else>
        <ItemDetailCard
          v-for="item in items"
          :key="item.id"
          :item="item"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import LoadingWrapper from '@/components/common/LoadingWrapper.vue';
import ItemDetailCard from './ItemDetailCard.vue';

export default defineComponent({
  name: 'ItemList',
  components: {
    LoadingWrapper,
    ItemDetailCard,
  },
  setup() {
    const store = useStore();
    const items = ref([]);
    const loading = ref(true);

    const fetchItems = async () => {
      try {
        const storeId = 'currentStoreId'; // Replace with actual store ID logic
        items.value = await store.dispatch('itemsStore/getItemsByStoreId', storeId);
      } catch (error) {
        console.error('Error fetching items:', error);
      } finally {
        loading.value = false;
      }
    };

    onMounted(fetchItems);

    return {
      items,
      loading,
    };
  },
});
</script>

<style scoped>
.item-list {
  padding: 20px;
}
</style>