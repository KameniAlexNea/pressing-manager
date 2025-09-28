<template>
  <div class="types-view">
    <h1>Item Types</h1>
    <p>Here you can view the different types of items associated with your stores.</p>
    <ul>
      <li v-for="type in itemTypes" :key="type.id">{{ type.name }}</li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useStores } from '../composables/useStores';

export default defineComponent({
  name: 'Types',
  setup() {
    const { fetchItemTypes } = useStores();
    const itemTypes = ref([]);

    onMounted(async () => {
      itemTypes.value = await fetchItemTypes();
    });

    return {
      itemTypes,
    };
  },
});
</script>

<style scoped>
.types-view {
  padding: 20px;
}
</style>