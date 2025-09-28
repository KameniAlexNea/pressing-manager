<template>
  <div class="store-settings">
    <h1>Store Settings</h1>
    <div v-if="store">
      <h2>{{ store.name }}</h2>
      <p>{{ store.description }}</p>
      <div>
        <h3>Manage Users</h3>
        <ManageUsers :storeId="store.id" />
      </div>
      <div>
        <h3>Invite Manager</h3>
        <InviteManagerForm :storeId="store.id" />
      </div>
    </div>
    <LoadingWrapper v-if="loading" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useStores } from '@/composables/useStores';
import LoadingWrapper from '@/components/common/LoadingWrapper.vue';
import ManageUsers from './ManageUsers.vue';
import InviteManagerForm from './InviteManagerForm.vue';

export default defineComponent({
  components: {
    LoadingWrapper,
    ManageUsers,
    InviteManagerForm,
  },
  setup() {
    const { getStoreById } = useStores();
    const store = ref(null);
    const loading = ref(true);
    const storeId = 'some-store-id'; // Replace with actual store ID

    onMounted(async () => {
      loading.value = true;
      store.value = await getStoreById(storeId);
      loading.value = false;
    });

    return {
      store,
      loading,
    };
  },
});
</script>

<style scoped>
.store-settings {
  padding: 20px;
}
</style>