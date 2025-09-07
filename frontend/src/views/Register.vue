<template>
  <div class="register-container">
    <a-card title="Inscription" style="max-width: 400px; margin: auto; margin-top: 100px;">
      <a-form layout="vertical" @submit.prevent="handleRegister">
        <a-form-item label="Email" :rules="[{ required: true, type: 'email', message: 'Email requis' }]">
          <a-input v-model:value="form.email" type="email" placeholder="votre@email.com" />
        </a-form-item>

        <a-form-item label="Mot de passe" :rules="[{ required: true, message: 'Mot de passe requis' }]">
          <a-input-password v-model:value="form.password" placeholder="Mot de passe (min 6 caractères)" />
        </a-form-item>

        <a-form-item label="Confirmer mot de passe" :rules="[{ required: true, message: 'Confirmation requise' }]">
          <a-input-password v-model:value="form.confirmPassword" placeholder="Confirmer le mot de passe" />
        </a-form-item>

        <a-form-item>
          <a-button type="primary" html-type="submit" block :loading="loading">
            S'inscrire
          </a-button>
        </a-form-item>

        <a-divider>ou</a-divider>

        <a-form-item v-if="!isMobile">
          <a-button @click="handleGoogleRegister" block :loading="loading">
            <template #icon>
              <GoogleOutlined />
            </template>
            S'inscrire avec Google
          </a-button>
        </a-form-item>

        <a-form-item>
          <a-button type="link" block @click="goToLogin">
            Déjà un compte ? Se connecter
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
  password: '',
  confirmPassword: ''
})

const handleRegister = async () => {
  if (!form.email || !form.password || !form.confirmPassword) {
    message.error('Veuillez remplir tous les champs')
    return
  }

  if (form.password !== form.confirmPassword) {
    message.error('Les mots de passe ne correspondent pas')
    return
  }

  if (form.password.length < 6) {
    message.error('Le mot de passe doit contenir au moins 6 caractères')
    return
  }

  loading.value = true
  try {
    await authStore.register(form.email, form.password)
    message.success('Inscription réussie')
    router.push('/')
  } catch (error: any) {
    message.error('Erreur d\'inscription: ' + error.message)
  } finally {
    loading.value = false
  }
}

const handleGoogleRegister = async () => {
  loading.value = true
  try {
    await authStore.loginWithGoogle()
    message.success('Inscription Google réussie ! Redirection...')
    router.push('/')
  } catch (error: any) {
    message.error(error.message || 'Erreur lors de l\'inscription Google')
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
