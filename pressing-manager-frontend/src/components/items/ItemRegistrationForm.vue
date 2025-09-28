<template>
  <div class="item-registration-form">
    <h2>Register New Item</h2>
    <form @submit.prevent="submitForm">
      <div>
        <label for="description">Description:</label>
        <input type="text" v-model="item.description" required />
      </div>
      <div>
        <label for="price">Price:</label>
        <input type="number" v-model="item.price" required />
      </div>
      <div>
        <label for="owner">Owner:</label>
        <input type="text" v-model="item.owner" required />
      </div>
      <div>
        <label for="notes">Notes:</label>
        <textarea v-model="item.notes"></textarea>
      </div>
      <button type="submit">Register Item</button>
    </form>
    <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { createItem } from '@/store/items';

export default defineComponent({
  name: 'ItemRegistrationForm',
  setup() {
    const item = ref({
      description: '',
      price: 0,
      owner: '',
      notes: ''
    });
    const errorMessage = ref('');

    const submitForm = async () => {
      try {
        await createItem(item.value);
        // Reset the form after successful registration
        item.value = { description: '', price: 0, owner: '', notes: '' };
        errorMessage.value = '';
      } catch (error) {
        errorMessage.value = 'Failed to register item. Please try again.';
      }
    };

    return {
      item,
      errorMessage,
      submitForm
    };
  }
});
</script>

<style scoped>
.item-registration-form {
  max-width: 400px;
  margin: auto;
}

.error {
  color: red;
}
</style>