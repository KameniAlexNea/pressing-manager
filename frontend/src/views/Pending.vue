<template>
  <a-card title="Liste des Articles" :bordered="false">
    <a-tabs v-model:activeKey="statusTab" centered>
      <a-tab-pane key="received" tab="Reçus" />
      <a-tab-pane key="cleaned" tab="Nettoyés" />
      <a-tab-pane key="delivered" tab="Livrés" />
    </a-tabs>

    <a-skeleton :loading="loading" active>
      <a-list item-layout="horizontal" :data-source="rows" :row-key="'id'" :pagination="{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['5', '10', '20', '50'] }">
        <template #renderItem="{ item }">
          <a-list-item>
            <template #actions>
              <a-button v-if="item.status === 'received'" type="primary" size="small"
                @click="markClean(item.id)" :loading="loading" :disabled="loading" aria-label="Marquer comme nettoyé">Nettoyé</a-button>
              <a-button v-if="item.status === 'cleaned'" type="primary" size="small"
                @click="markDelivered(item.id)" :loading="loading" :disabled="loading" aria-label="Marquer comme livré">Livré</a-button>
              <a-button size="small" @click="viewItem(item.id)" aria-label="Voir détails">Détails</a-button>
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
import { getAll, updateStatus, type ClothingItem } from '../store/items'
import { useFormatting, useNavigation } from '../composables/useFormatting'
import { message } from 'ant-design-vue'


const statusTab = ref<'received' | 'cleaned' | 'delivered'>('received')
const rows = ref<ClothingItem[]>([])
const loading = ref(false)
const { formatDate } = useFormatting()
const { goToItem } = useNavigation()

async function load() {
  loading.value = true
  try {
    const all = await getAll()
    rows.value = all
      .filter(i => i.status === statusTab.value)
      .sort((a, b) => new Date(b.date_received).getTime() - new Date(a.date_received).getTime())
    if (rows.value.length === 0) {
      message.info('Aucun article dans cette catégorie.')
    }
  } catch (e) {
    message.error('Erreur lors du chargement des articles.')
  } finally {
    loading.value = false
  }
}


async function updateAndRefresh(id: string, status: 'cleaned' | 'delivered') {
  try {
    await updateStatus(id, status)
    message.success(status === 'cleaned' ? 'Article marqué comme nettoyé.' : 'Article marqué comme livré.')
    await load()
  } catch (e) {
    message.error('Erreur lors de la mise à jour du statut.')
  }
}

const markClean = (id: string) => updateAndRefresh(id, 'cleaned')
const markDelivered = (id: string) => updateAndRefresh(id, 'delivered')

function viewItem(id: string) {
  goToItem(id)
}



watch(statusTab, load, { immediate: true })
</script>
