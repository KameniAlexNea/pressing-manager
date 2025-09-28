<template>
  <div class="store-view">
    <AppHeader />
    <div class="store-details">
      <h1>{{ store.name }}</h1>
      <p>{{ store.description }}</p>
      <p><strong>Owner:</strong> {{ store.owner }}</p>
      <p><strong>Status:</strong> {{ store.status }}</p>
      <p><strong>Items Count:</strong> {{ store.itemsCount }}</p>
    </div>
    <div class="store-items">
      <h2>Items in this Store</h2>
      <ItemList :items="store.items" />
    </div>
    <AppFooter />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useStores } from '../composables/useStores';
import AppHeader from '../components/layout/AppHeader.vue';
import AppFooter from '../components/layout/AppFooter.vue';
import ItemList from '../components/items/ItemList.vue';

export default defineComponent({
  components: {
    AppHeader,
    AppFooter,
    ItemList,
  },
  setup() {
    const route = useRoute();
    const storeId = route.params.id as string;
    const { getStoreById } = useStores();
    const store = ref(null);

    onMounted(async () => {
      store.value = await getStoreById(storeId);
    });

    return {
      store,
    };
  },
});
</script>

<style scoped>
.store-view {
  padding: 20px;
}

.store-details {
  margin-bottom: 20px;
}

.store-items {
  margin-top: 20px;
}
</style>