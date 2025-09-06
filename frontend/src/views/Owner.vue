<template>
  <a-card title="Recherche par Propriétaire" :bordered="false">
    <a-form @submit.prevent="load">
      <a-form-item>
        <a-input-search
          v-model:value="owner"
          placeholder="Entrez le nom du propriétaire"
          enter-button="Rechercher"
          size="large"
          @search="load"
        />
      </a-form-item>
    </a-form>

    <a-skeleton :loading="loading" active>
      <a-list
        v-if="searched"
        item-layout="horizontal"
        :data-source="rows"
        :row-key="'id'"
      >
        <template #renderItem="{ item }">
          <a-list-item>
            <template #actions>
              <a-button size="small" @click="viewItem(item.id)">Détails</a-button>
            </template>
            <a-list-item-meta>
              <template #title>
                <a @click="viewItem(item.id)">Article #{{ item.id }}</a>
              </template>
              <template #description>
                <p>{{ item.description }}</p>
                Reçu le: {{ formatDate(item.date_received) }}
              </template>
            </a-list-item-meta>
            <template #extra>
              <a-tag :color="statusColor(item.status)">{{ item.status }}</a-tag>
            </template>
          </a-list-item>
        </template>
      </a-list>
      <a-empty v-if="searched && rows.length === 0" description="Aucun article trouvé pour ce propriétaire." />
    </a-skeleton>
  </a-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getByOwner, type ClothingItem } from '../store/items'
import dayjs from 'dayjs'

const owner = ref('')
const rows = ref<ClothingItem[]>([])
const loading = ref(false)
const searched = ref(false)
const router = useRouter()

async function load() {
  if (!owner.value) return
  loading.value = true
  searched.value = true
  rows.value = await getByOwner(owner.value)
  loading.value = false
}

function viewItem(id: string) {
  router.push(`/item?id=${id}`)
}

function formatDate(date?: string | Date): string {
  return date ? dayjs(date).format('DD/MM/YYYY') : 'N/A'
}

function statusColor(status: string) {
  switch (status) {
    case 'received': return 'blue';
    case 'cleaned': return 'orange';
    case 'delivered': return 'green';
    default: return 'default';
  }
}
</script>
