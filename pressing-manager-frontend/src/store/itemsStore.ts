import { reactive, computed } from 'vue';
import { ClothingItem } from './items';
import { Store } from './stores';

export interface ItemsStore {
  storeId: string;
  items: ClothingItem[];
}

const state = reactive<ItemsStore>({
  storeId: '',
  items: [],
});

export const useItemsStore = () => {
  const setStoreId = (id: string) => {
    state.storeId = id;
  };

  const setItems = (items: ClothingItem[]) => {
    state.items = items;
  };

  const getItems = computed(() => state.items);

  return {
    setStoreId,
    setItems,
    getItems,
  };
};