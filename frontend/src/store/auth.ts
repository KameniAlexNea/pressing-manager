import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {
  auth,
  loginWithEmail,
  registerWithEmail,
  signInWithGoogle,
  logout as firebaseLogout,
  onAuthStateChanged,
  handleRedirectResult,
  type User
} from '../firebase'

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
          // Note: No backend API call needed when using Firebase directly
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
      loading.value = true
      const userCredential = await loginWithEmail(email, password)
      // Token and user will be set by onAuthStateChanged listener
      return userCredential.user
    } catch (error: any) {
      console.error('Login error:', error)
      throw new Error(error.message || 'Login failed')
    } finally {
      loading.value = false
    }
  }

  const register = async (email: string, password: string) => {
    try {
      loading.value = true
      const userCredential = await registerWithEmail(email, password)
      // Token and user will be set by onAuthStateChanged listener
      return userCredential.user
    } catch (error: any) {
      console.error('Registration error:', error)
      throw new Error(error.message || 'Registration failed')
    } finally {
      loading.value = false
    }
  }

  const loginWithGoogle = async () => {
    try {
      loading.value = true
      // Google sign-in is disabled on mobile. Only allow on web.
      if ((window as any).Capacitor?.isNativePlatform) {
        throw new Error('Connexion Google non disponible sur mobile.');
      }
      const userCredential = await signInWithGoogle();
      return userCredential.user;
    } catch (error: any) {
      console.error('Google login error:', error)
      throw new Error(error.message || 'Google login failed')
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      await firebaseLogout()
      user.value = null
      token.value = null
    } catch (error: any) {
      console.error('Logout error:', error)
      throw new Error(error.message || 'Logout failed')
    }
  }

  const getAuthHeaders = () => {
    return token.value ? { 'Authorization': `Bearer ${token.value}` } : {}
  }

  // Handle redirect result (for mobile Google sign-in)
  const handleAuthRedirectResult = async () => {
    try {
      return await handleRedirectResult()
    } catch (error: any) {
      console.error('Redirect result error:', error)
      throw error
    }
  }

  return {
    user,
    loading,
    token,
    isAuthenticated,
    initAuth,
    login,
    register,
    loginWithGoogle,
    logout,
    getAuthHeaders,
    handleAuthRedirectResult
  }
})
