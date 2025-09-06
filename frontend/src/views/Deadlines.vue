<template>
  <a-card title="Suivi des Délais" :bordered="false">
    <a-form @submit.prevent="load">
      <a-form-item>
        <a-input-search
          v-model:value="owner"
          placeholder="Filtrer par propriétaire (optionnel)"
          enter-button="Rechercher"
          @search="load"
        />
      </a-form-item>
    </a-form>

    <a-skeleton :loading="loading" active>
      <a-list
        item-layout="horizontal"
        :data-source="rows"
        :row-key="'id'"
      >
        <template #renderItem="{ item }">
          <a-list-item :class="rowClass(item)">
            <template #actions>
              <a-button size="small" @click="viewItem(item.id)">Détails</a-button>
            </template>
            <a-list-item-meta>
              <template #title>
                <a @click="viewItem(item.id)">{{ item.owner }} - Article #{{ item.id }}</a>
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
  </a-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getWithDeadlines, type ClothingItemWithDeadline } from '../store/items'
import dayjs from 'dayjs'

const owner = ref('')
const rows = ref<ClothingItemWithDeadline[]>([])
const loading = ref(false)
const router = useRouter()

async function load() {
  loading.value = true
  rows.value = await getWithDeadlines(owner.value || undefined)
  loading.value = false
}

function viewItem(id: string) {
  router.push(`/item?id=${id}`)
}

function formatDate(date?: string | Date): string {
  return date ? dayjs(date).format('DD/MM/YYYY') : 'N/A'
}

function rowClass(record: any) {
  if (record.days_left == null) return ''
  if (record.days_left < 0) return 'deadline-late'
  if (record.days_left <= 1) return 'deadline-soon'
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

load()
</script>

<style scoped>
.deadline-late {
  background-color: #fff1f0;
}
.deadline-soon {
  background-color: #fffbe6;
}
</style>
