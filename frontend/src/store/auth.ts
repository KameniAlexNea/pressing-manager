import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from '../firebase'
import type { User } from 'firebase/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(true)
  const token = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value)

  // Initialize auth state listener
  const initAuth = () => {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          user.value = firebaseUser
          token.value = await firebaseUser.getIdToken()
          // Send token to backend for verification
          try {
            const response = await fetch('/api/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ idToken: token.value })
            })
            if (!response.ok) {
              console.error('Backend login failed')
            }
          } catch (error) {
            console.error('Backend login error:', error)
          }
        } else {
          user.value = null
          token.value = null
        }
        loading.value = false
        resolve(firebaseUser)
      })
    })
  }

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      user.value = userCredential.user
      token.value = await userCredential.user.getIdToken()
      return userCredential.user
    } catch (error) {
      throw error
    }
  }

  const register = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      user.value = userCredential.user
      token.value = await userCredential.user.getIdToken()
      return userCredential.user
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      user.value = null
      token.value = null
    } catch (error) {
      throw error
    }
  }

  const getAuthHeaders = () => {
    return token.value ? { 'Authorization': `Bearer ${token.value}` } : {}
  }

  return {
    user,
    loading,
    token,
    isAuthenticated,
    initAuth,
    login,
    register,
    logout,
    getAuthHeaders
  }
})
