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
        
        <a-form-item>
          <a-button @click="handleGoogleLogin" block :loading="loading">
            <template #icon>
              <GoogleOutlined />
            </template>
            Se connecter avec Google
          </a-button>
        </a-form-item>
        
        <a-form-item>
          <a-button type="link" block @click="showRegister = !showRegister">
            {{ showRegister ? 'Déjà un compte ? Se connecter' : 'Pas de compte ? S\'inscrire' }}
          </a-button>
        </a-form-item>
      </a-form>
      
      <!-- Registration Form -->
      <div v-if="showRegister">
        <a-divider>Inscription</a-divider>
        <a-form layout="vertical" @submit.prevent="handleRegister">
          <a-form-item label="Email">
            <a-input v-model:value="registerForm.email" type="email" placeholder="votre@email.com" />
          </a-form-item>
          
          <a-form-item label="Mot de passe">
            <a-input-password v-model:value="registerForm.password" placeholder="Mot de passe (min 6 caractères)" />
          </a-form-item>
          
          <a-form-item label="Confirmer mot de passe">
            <a-input-password v-model:value="registerForm.confirmPassword" placeholder="Confirmer le mot de passe" />
          </a-form-item>
          
          <a-form-item>
            <a-button type="default" html-type="submit" block :loading="loading">
              S'inscrire
            </a-button>
          </a-form-item>
        </a-form>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'
import { message } from 'ant-design-vue'
import { GoogleOutlined } from '@ant-design/icons-vue'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const showRegister = ref(false)

const form = reactive({
  email: '',
  password: ''
})

const registerForm = reactive({
  email: '',
  password: '',
  confirmPassword: ''
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

const handleRegister = async () => {
  if (!registerForm.email || !registerForm.password || !registerForm.confirmPassword) {
    message.error('Veuillez remplir tous les champs')
    return
  }
  
  if (registerForm.password !== registerForm.confirmPassword) {
    message.error('Les mots de passe ne correspondent pas')
    return
  }
  
  if (registerForm.password.length < 6) {
    message.error('Le mot de passe doit contenir au moins 6 caractères')
    return
  }
  
  loading.value = true
  try {
    await authStore.register(registerForm.email, registerForm.password)
    message.success('Inscription réussie')
    router.push('/')
  } catch (error: any) {
    message.error('Erreur d\'inscription: ' + error.message)
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
