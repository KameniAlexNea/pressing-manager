<template>
  <div class="invite-manager-form">
    <h2>Invite Manager</h2>
    <form @submit.prevent="sendInvite">
      <div>
        <label for="email">Manager Email:</label>
        <input type="email" v-model="email" required />
      </div>
      <div>
        <label for="store">Select Store:</label>
        <select v-model="selectedStore" required>
          <option v-for="store in stores" :key="store.id" :value="store.id">
            {{ store.name }}
          </option>
        </select>
      </div>
      <button type="submit">Send Invite</button>
    </form>
    <div v-if="message" class="message">{{ message }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useStores } from '@/composables/useStores';
import { sendInvite } from '@/services/invitesService';

export default defineComponent({
  setup() {
    const email = ref('');
    const selectedStore = ref('');
    const message = ref('');
    const { stores } = useStores();

    const sendInvite = async () => {
      try {
        await sendInvite(selectedStore.value, email.value);
        message.value = 'Invite sent successfully!';
        email.value = '';
        selectedStore.value = '';
      } catch (error) {
        message.value = 'Error sending invite. Please try again.';
      }
    };

    return {
      email,
      selectedStore,
      message,
      stores,
      sendInvite,
    };
  },
});
</script>

<style scoped>
.invite-manager-form {
  max-width: 400px;
  margin: auto;
}

.message {
  margin-top: 10px;
  color: green;
}
</style>