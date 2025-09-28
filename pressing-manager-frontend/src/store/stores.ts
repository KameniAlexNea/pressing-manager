import { reactive } from 'vue';
import { db } from '../firebase';
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';

export type Store = {
  id: string;
  name: string;
  ownerId: string;
  managers: string[];
  items: string[];
};

const state = reactive({
  stores: [] as Store[],
});

export const useStores = () => {
  const fetchStores = async (userId: string) => {
    const q = query(collection(db, 'stores'), where('ownerId', '==', userId));
    const querySnapshot = await getDocs(q);
    state.stores = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Store[];
  };

  const createStore = async (storeData: Omit<Store, 'id'>) => {
    const docRef = await addDoc(collection(db, 'stores'), storeData);
    state.stores.push({ id: docRef.id, ...storeData });
  };

  const updateStore = async (storeId: string, updatedData: Partial<Store>) => {
    const docRef = doc(db, 'stores', storeId);
    await updateDoc(docRef, updatedData);
    const storeIndex = state.stores.findIndex(store => store.id === storeId);
    if (storeIndex !== -1) {
      state.stores[storeIndex] = { ...state.stores[storeIndex], ...updatedData };
    }
  };

  const subscribeToStores = (userId: string) => {
    const q = query(collection(db, 'stores'), where('ownerId', '==', userId));
    onSnapshot(q, (querySnapshot) => {
      state.stores = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Store[];
    });
  };

  return {
    state,
    fetchStores,
    createStore,
    updateStore,
    subscribeToStores,
  };
};