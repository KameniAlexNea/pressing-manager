import { ref } from 'vue';
import { db } from '../firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

export type Invite = {
  id: string;
  email: string;
  storeId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
};

const invites = ref<Invite[]>([]);

export const useInvitesStore = () => {
  const fetchInvites = async (storeId: string) => {
    const q = query(collection(db, 'invites'), where('storeId', '==', storeId));
    const querySnapshot = await getDocs(q);
    invites.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Invite[];
  };

  const sendInvite = async (email: string, storeId: string) => {
    const inviteData = {
      email,
      storeId,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    const docRef = await addDoc(collection(db, 'invites'), inviteData);
    invites.value.push({ id: docRef.id, ...inviteData });
  };

  return {
    invites,
    fetchInvites,
    sendInvite,
  };
};