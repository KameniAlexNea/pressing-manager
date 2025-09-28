import { ref } from 'vue';
import { useStore } from 'vuex';
import { Store } from '../store/types';

export function useStores() {
  const store = useStore();
  const stores = ref<Store[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchStores = async () => {
    loading.value = true;
    error.value = null;

    try {
      const response = await store.dispatch('stores/fetchStores');
      stores.value = response;
    } catch (err) {
      error.value = 'Failed to load stores';
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const inviteManager = async (storeId: string, email: string) => {
    try {
      await store.dispatch('invites/inviteManager', { storeId, email });
    } catch (err) {
      console.error('Failed to invite manager:', err);
    }
  };

  return {
    stores,
    loading,
    error,
    fetchStores,
    inviteManager,
  };
}