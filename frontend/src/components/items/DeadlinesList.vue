<template>
  <a-skeleton :loading="loading" active>
    <a-list item-layout="horizontal" :data-source="rows" :row-key="'id'">
      <template #renderItem="{ item }">
        <a-list-item :class="rowClass(item)">
          <template #actions>
            <a-button size="small" @click="$emit('view', item.id)">Détails</a-button>
          </template>
          <a-list-item-meta>
            <template #title>
              <a @click="$emit('view', item.id)">{{ item.owner }} - Article #{{ item.id }}</a>
            </template>
            <template #description>
              Promis pour le: {{ formatDate(item.date_promised) }}
            </template>
          </a-list-item-meta>
          <template #extra>
            <a-tag :color="deadlineColor(item.days_left)">
              {{ deadlineText(item.days_left) }}
            </a-tag>
          </template>
        </a-list-item>
      </template>
    </a-list>
    <a-empty v-if="!loading && rows.length === 0" description="Aucun délai à suivre." />
  </a-skeleton>
</template>

<script setup lang="ts">
import { useFormatting } from '../../composables/useFormatting'
import type { ClothingItemWithDeadline } from '@/store/items'

defineProps<{
  rows: ClothingItemWithDeadline[]
  loading: boolean
}>()

defineEmits(['view'])

const { formatDate } = useFormatting()

function rowClass(record: ClothingItemWithDeadline) {
  const d = record.days_left
  if (d == null) return ''
  if (d < 0) return 'deadline-late'
  if (d <= 1) return 'deadline-soon'
  return ''
}

function deadlineColor(days_left?: number | null): string {
  if (days_left == null) return 'default'
  if (days_left < 0) return 'error'
  if (days_left <= 1) return 'warning'
  return 'success'
}

function deadlineText(days_left?: number | null): string {
  if (days_left == null) return 'N/A'
  if (days_left < 0) return `En retard de ${Math.abs(days_left)} jours`
  if (days_left === 0) return 'Aujourd\'hui'
  if (days_left === 1) return 'Demain'
  return `Dans ${days_left} jours`
}
</script>

<style scoped>
.deadline-late { background-color: #fff1f0; }
.deadline-soon { background-color: #fffbe6; }
</style>
