import { defineStore } from 'pinia';
import { ref } from 'vue';
import { auth } from '../firebase'; // Assuming firebase is initialized in this file
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const loading = ref(false);
  const error = ref(null);

  const login = async (email, password) => {
    loading.value = true;
    error.value = null;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      user.value = userCredential.user;
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    loading.value = true;
    error.value = null;

    try {
      await signOut(auth);
      user.value = null;
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  const isAdmin = () => {
    return user.value && user.value.role === 'admin';
  };

  const isManager = () => {
    return user.value && user.value.role === 'manager';
  };

  return {
    user,
    loading,
    error,
    login,
    logout,
    isAdmin,
    isManager,
  };
});