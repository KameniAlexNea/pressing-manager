<template>
  <a-card title="Liste des Articles" :bordered="false">
    <a-tabs v-model:activeKey="statusTab" centered>
      <a-tab-pane key="received" tab="Reçus" />
      <a-tab-pane key="cleaned" tab="Nettoyés" />
      <a-tab-pane key="delivered" tab="Livrés" />
    </a-tabs>

    <a-skeleton :loading="loading" active>
      <a-list item-layout="horizontal" :data-source="rows" :row-key="'id'">
        <template #renderItem="{ item }">
          <a-list-item>
            <template #actions>
              <a-button v-if="item.status === 'received'" type="primary" size="small"
                @click="markClean(item.id)">Nettoyé</a-button>
              <a-button v-if="item.status === 'cleaned'" type="primary" size="small"
                @click="markDelivered(item.id)">Livré</a-button>
              <a-button size="small" @click="viewItem(item.id)">Détails</a-button>
            </template>
            <a-list-item-meta>
              <template #title>
                <a>{{ item.owner }} - {{ item.id }}</a>
              </template>
              <template #description>
                <p>{{ item.description }}</p>
                Reçu le: {{ formatDate(item.date_received) }} | Promis pour le: {{ formatDate(item.date_promised) }}
              </template>
            </a-list-item-meta>
          </a-list-item>
        </template>
      </a-list>
      <a-empty v-if="!loading && rows.length === 0" description="Aucun article dans cette catégorie." />
    </a-skeleton>
  </a-card>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getAll, updateStatus, type ClothingItem } from '../store/items'
import dayjs from 'dayjs'

const router = useRouter()
const statusTab = ref<'received' | 'cleaned' | 'delivered'>('received')
const rows = ref<ClothingItem[]>([])
const loading = ref(false)

async function load() {
  loading.value = true
  const all = await getAll()
  rows.value = all
    .filter(i => i.status === statusTab.value)
    .sort((a, b) => new Date(b.date_received).getTime() - new Date(a.date_received).getTime())
  loading.value = false
}

async function updateAndRefresh(id: string, status: 'cleaned' | 'delivered') {
  await updateStatus(id, status)
  await load()
}

const markClean = (id: string) => updateAndRefresh(id, 'cleaned')
const markDelivered = (id: string) => updateAndRefresh(id, 'delivered')

function viewItem(id: string) {
  router.push(`/item?id=${id}`)
}

function formatDate(date?: string | Date): string {
  return date ? dayjs(date).format('DD/MM/YYYY') : 'N/A'
}

watch(statusTab, load, { immediate: true })
</script>
