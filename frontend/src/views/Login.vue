<template>
  <div class="login-container">
    <a-card title="Connexion" style="max-width: 400px; margin: auto; margin-top: 100px;">
      <a-form layout="vertical" @submit.prevent="handleLogin">
        <a-form-item label="Email" :rules="[{ required: true, type: 'email', message: 'Email requis' }]">
          <a-input v-model:value="form.email" type="email" placeholder="votre@email.com" />
        </a-form-item>
        
        <a-form-item label="Mot de passe" :rules="[{ required: true, message: 'Mot de passe requis' }]">
          <a-input-password v-model:value="form.password" placeholder="Mot de passe" />
        </a-form-item>
        
        <a-form-item>
          <a-button type="primary" html-type="submit" block :loading="loading">
            Se connecter
          </a-button>
        </a-form-item>
        
        <a-divider>ou</a-divider>
        
        <a-form-item v-if="!isMobile">
          <a-button @click="handleGoogleLogin" block :loading="loading">
            <template #icon>
              <GoogleOutlined />
            </template>
            Se connecter avec Google
          </a-button>
        </a-form-item>
        
        <a-form-item>
          <a-button type="link" block @click="goToRegister">
            Pas de compte ? S'inscrire
          </a-button>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'
import { message } from 'ant-design-vue'
import { GoogleOutlined } from '@ant-design/icons-vue'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)

// Detect mobile (basic user agent check)
const isMobile = computed(() => /android|iphone|ipad|ipod/i.test(navigator.userAgent))

const form = reactive({
  email: '',
  password: ''
})

const handleLogin = async () => {
  if (!form.email || !form.password) {
    message.error('Veuillez remplir tous les champs')
    return
  }
  
  loading.value = true
  try {
    await authStore.login(form.email, form.password)
    message.success('Connexion réussie')
    router.push('/')
  } catch (error: any) {
    message.error('Erreur de connexion: ' + error.message)
  } finally {
    loading.value = false
  }
}

const handleGoogleLogin = async () => {
  loading.value = true
  try {
    await authStore.loginWithGoogle()
    message.success('Connexion Google réussie ! Redirection...')
    router.push('/')
  } catch (error: any) {
    message.error(error.message || 'Erreur lors de la connexion Google')
  } finally {
    loading.value = false
  }
}

const goToRegister = () => {
  router.push('/register')
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
