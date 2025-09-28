<template>
  <div class="store-detail">
    <h1>{{ store.name }}</h1>
    <p><strong>Owner:</strong> {{ store.owner }}</p>
    <p><strong>Description:</strong> {{ store.description }}</p>
    <p><strong>Created At:</strong> {{ formatDate(store.createdAt) }}</p>
    
    <h2>Items in Store</h2>
    <ItemList :items="store.items" />

    <div v-if="isAdmin">
      <router-link :to="{ name: 'StoreSettings', params: { storeId: store.id } }">Manage Store Settings</router-link>
      <router-link :to="{ name: 'ManageUsers', params: { storeId: store.id } }">Manage Users</router-link>
      <InviteManagerForm :storeId="store.id" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useStores } from '@/composables/useStores';
import { useAuthStore } from '@/store/auth';
import ItemList from '@/components/items/ItemList.vue';
import InviteManagerForm from '@/components/stores/InviteManagerForm.vue';

export default defineComponent({
  components: {
    ItemList,
    InviteManagerForm
  },
  setup(props) {
    const storeId = props.storeId; // Assume storeId is passed as a prop
    const { getStoreById } = useStores();
    const authStore = useAuthStore();
    const store = ref(null);
    const isAdmin = ref(false);

    onMounted(async () => {
      store.value = await getStoreById(storeId);
      isAdmin.value = authStore.user?.role === 'admin';
    });

    const formatDate = (date: string) => {
      return new Date(date).toLocaleDateString();
    };

    return {
      store,
      isAdmin,
      formatDate
    };
  }
});
</script>

<style scoped>
.store-detail {
  padding: 20px;
}
</style>