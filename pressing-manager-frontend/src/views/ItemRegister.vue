<template>
  <div class="item-register">
    <h1>Register New Item</h1>
    <ItemRegistrationForm @submit="handleSubmit" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ItemRegistrationForm from '../components/items/ItemRegistrationForm.vue';
import { useStores } from '../composables/useStores';

export default defineComponent({
  components: {
    ItemRegistrationForm,
  },
  setup() {
    const { registerItem } = useStores();

    const handleSubmit = async (itemData: any) => {
      try {
        await registerItem(itemData);
        // Handle successful registration (e.g., show a success message or redirect)
      } catch (error) {
        // Handle error (e.g., show an error message)
        console.error('Error registering item:', error);
      }
    };

    return {
      handleSubmit,
    };
  },
});
</script>

<style scoped>
.item-register {
  padding: 20px;
}
</style>