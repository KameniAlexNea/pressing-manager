<template>
  <a-card :bordered="false" class="quick-action-card" @click="onClick">
    <div class="action-content">
      <div class="action-icon" :class="{ 'danger': danger }">
        <component :is="icon" />
        <a-badge v-if="badge && badge > 0" :count="badge" class="action-badge" />
      </div>
      <div class="action-text">
        <div class="action-title">{{ title }}</div>
        <div class="action-description">{{ description }}</div>
      </div>
    </div>
  </a-card>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

interface Props {
  title: string
  description: string
  icon: Component
  badge?: number | null
  danger?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  badge: null,
  danger: false
})

const emit = defineEmits<{
  click: []
}>()

function onClick() {
  emit('click')
}
</script>

<style scoped>
.quick-action-card {
  cursor: pointer;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  height: 100%;
  min-height: 120px;
  border: 2px solid transparent;
}

.quick-action-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-4px);
  border-color: #1677ff;
}

.action-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 100%;
  padding: 20px 16px;
}

.action-icon {
  font-size: 36px;
  color: #1677ff;
  margin-bottom: 16px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.quick-action-card:hover .action-icon {
  transform: scale(1.1);
}

.action-icon.danger {
  color: #ff4d4f;
}

.action-badge {
  position: absolute;
  top: -10px;
  right: -10px;
  z-index: 1;
}

.action-text {
  flex: 1;
}

.action-title {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 6px;
  transition: color 0.3s ease;
}

.quick-action-card:hover .action-title {
  color: #1677ff;
}

.action-description {
  font-size: 13px;
  color: #8c8c8c;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .action-content {
    padding: 16px 12px;
  }

  .action-icon {
    font-size: 32px;
    margin-bottom: 12px;
  }

  .action-title {
    font-size: 15px;
  }

  .action-description {
    font-size: 12px;
  }
}

@media (max-width: 576px) {
  .quick-action-card {
    min-height: 100px;
  }

  .action-content {
    flex-direction: row;
    text-align: left;
    padding: 16px;
  }

  .action-icon {
    font-size: 28px;
    margin-bottom: 0;
    margin-right: 16px;
    flex-shrink: 0;
  }

  .action-text {
    flex: 1;
  }

  .action-title {
    font-size: 14px;
    margin-bottom: 4px;
  }

  .action-description {
    font-size: 11px;
  }
}
</style>
