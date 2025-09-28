<template>
  <div v-if="isLoading" class="loading-wrapper">
    <div class="loading-spinner"></div>
    <p>Loading...</p>
  </div>
  <slot v-else></slot>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'LoadingWrapper',
  props: {
    isLoading: {
      type: Boolean,
      required: true
    }
  }
});
</script>

<style scoped>
.loading-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.loading-spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #3b82f6;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>