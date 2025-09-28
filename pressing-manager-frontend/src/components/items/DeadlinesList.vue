<template>
  <div>
    <h2>Deadlines List</h2>
    <ul v-if="deadlines.length">
      <li v-for="item in deadlines" :key="item.id">
        <div>
          <strong>{{ item.description }}</strong>
          <p>Due in {{ item.days_left }} days</p>
        </div>
      </li>
    </ul>
    <p v-else>No deadlines available.</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useStores } from '@/composables/useStores';

export default defineComponent({
  name: 'DeadlinesList',
  setup() {
    const { getDeadlines } = useStores();
    const deadlines = computed(() => getDeadlines());

    return {
      deadlines,
    };
  },
});
</script>

<style scoped>
h2 {
  margin-bottom: 1rem;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  margin: 0.5rem 0;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
}
</style>