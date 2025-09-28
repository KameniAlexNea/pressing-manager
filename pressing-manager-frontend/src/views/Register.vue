<template>
  <div class="register">
    <h1>Register</h1>
    <form @submit.prevent="handleSubmit">
      <div>
        <label for="email">Email:</label>
        <input type="email" v-model="email" required />
      </div>
      <div>
        <label for="password">Password:</label>
        <input type="password" v-model="password" required />
      </div>
      <div>
        <label for="role">Role:</label>
        <select v-model="role" required>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <button type="submit">Register</button>
    </form>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </div>
</template>

<script lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../store/auth';

export default {
  setup() {
    const email = ref('');
    const password = ref('');
    const role = ref('manager');
    const errorMessage = ref('');
    const authStore = useAuthStore();

    const handleSubmit = async () => {
      try {
        await authStore.registerUser(email.value, password.value, role.value);
        // Redirect or show success message
      } catch (error) {
        errorMessage.value = error.message;
      }
    };

    return {
      email,
      password,
      role,
      errorMessage,
      handleSubmit,
    };
  },
};
</script>

<style scoped>
.register {
  max-width: 400px;
  margin: auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.error {
  color: red;
}
</style>