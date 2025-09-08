<template>
  <a-skeleton :loading="loading" active>
    <a-list
      item-layout="horizontal"
      :data-source="rows"
      :row-key="'id'"
      :pagination="pagination"
    >
      <template #renderItem="{ item }">
        <a-list-item>
          <template #actions>
            <a-button size="small" @click="$emit('view', item.id)">Détails</a-button>
          </template>
          <a-list-item-meta>
            <template #title>
              <a @click="$emit('view', item.id)">Article #{{ item.id }}</a>
            </template>
            <template #description>
              <p v-if="item.description">{{ item.description }}</p>
              Reçu le: {{ formatDate(item.date_received) }}
            </template>
          </a-list-item-meta>
          <template #extra>
            <a-tag :color="statusColor(item.status)">{{ item.status }}</a-tag>
          </template>
        </a-list-item>
      </template>
    </a-list>
    <a-empty v-if="!loading && rows.length === 0" description="Aucun article trouvé pour ce propriétaire." />
  </a-skeleton>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFormatting } from '../../composables/useFormatting'

type Row = {
  id: string
  description?: string
  date_received: string
  status: 'received' | 'cleaned' | 'delivered'
}

const props = withDefaults(defineProps<{ rows: Row[]; loading?: boolean; pageSize?: number }>(), {
  loading: false,
  pageSize: 10,
})

const { formatDate, statusColor } = useFormatting()

const pagination = computed(() => {
  if (!props.rows || props.rows.length <= props.pageSize) return false
  return {
    pageSize: props.pageSize,
    showSizeChanger: true,
    pageSizeOptions: ['5', '10', '20', '50'],
  }
})
</script>

<style scoped></style>
