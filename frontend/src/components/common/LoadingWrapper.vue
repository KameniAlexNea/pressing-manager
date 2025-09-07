<template>
  <div class="loading-error-wrapper">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <a-skeleton v-if="showSkeleton" active :paragraph="{ rows: skeletonRows }" />
      <div v-else class="spinner-container">
        <a-spin :size="spinSize" />
        <div v-if="loadingText" class="loading-text">{{ loadingText }}</div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <a-result
        status="error"
        :title="errorTitle"
        :sub-title="computedErrorSubTitle"
      >
        <template #extra>
          <a-space>
            <a-button type="primary" @click="$emit('retry')" v-if="showRetry">
              Réessayer
            </a-button>
            <a-button @click="$emit('dismiss')" v-if="showDismiss">
              Fermer
            </a-button>
          </a-space>
        </template>
      </a-result>
    </div>

    <!-- Success State / Content -->
    <div v-else class="content-state">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  loading?: boolean
  error?: string | null
  showSkeleton?: boolean
  skeletonRows?: number
  spinSize?: 'small' | 'default' | 'large'
  loadingText?: string
  errorTitle?: string
  errorSubTitle?: string
  showRetry?: boolean
  showDismiss?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: null,
  showSkeleton: false,
  skeletonRows: 4,
  spinSize: 'default',
  loadingText: '',
  errorTitle: 'Une erreur est survenue',
  errorSubTitle: '',
  showRetry: true,
  showDismiss: false
})

const emit = defineEmits<{
  retry: []
  dismiss: []
}>()

const computedErrorSubTitle = computed(() => {
  if (props.errorSubTitle) return props.errorSubTitle
  if (props.error) return props.error
  return 'Veuillez réessayer plus tard.'
})
</script>

<style scoped>
.loading-error-wrapper {
  width: 100%;
  min-height: 200px;
}

.loading-state {
  padding: 24px;
}

.spinner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: 16px;
}

.loading-text {
  color: #666;
  font-size: 14px;
}

.error-state {
  padding: 24px 0;
}

.content-state {
  width: 100%;
}

@media (max-width: 768px) {
  .loading-state,
  .error-state {
    padding: 16px;
  }
  
  .spinner-container {
    min-height: 150px;
  }
}
</style>
