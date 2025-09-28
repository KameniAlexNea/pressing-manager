<template>
  <div class="manage-users">
    <h1>Manage Users</h1>
    <div v-if="loading" class="loading">
      <LoadingWrapper />
    </div>
    <div v-else>
      <h2>Users in Store: {{ storeName }}</h2>
      <ul>
        <li v-for="user in users" :key="user.id">
          <span>{{ user.email }} - {{ user.role }}</span>
          <button @click="removeUser(user.id)">Remove</button>
        </li>
      </ul>
      <InviteManagerForm @invited="fetchUsers" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import LoadingWrapper from '../common/LoadingWrapper.vue';
import InviteManagerForm from './InviteManagerForm.vue';

export default defineComponent({
  components: {
    LoadingWrapper,
    InviteManagerForm,
  },
  setup() {
    const store = useStore();
    const users = ref([]);
    const loading = ref(true);
    const storeName = ref('');

    const fetchUsers = async () => {
      loading.value = true;
      const storeId = store.state.stores.currentStoreId; // Assuming currentStoreId is set in the store
      const response = await store.dispatch('stores/fetchUsers', storeId);
      users.value = response.users;
      storeName.value = response.storeName;
      loading.value = false;
    };

    const removeUser = async (userId: string) => {
      await store.dispatch('stores/removeUser', userId);
      fetchUsers();
    };

    onMounted(() => {
      fetchUsers();
    });

    return {
      users,
      loading,
      storeName,
      removeUser,
    };
  },
});
</script>

<style scoped>
.manage-users {
  padding: 20px;
}
.loading {
  text-align: center;
}
</style>