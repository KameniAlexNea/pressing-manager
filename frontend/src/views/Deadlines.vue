
<template>
  <a-card title="Suivi des Délais" :bordered="false">
    <GlobalSearch @search="onSearch" @clear="onClear" />
    <DeadlinesList :rows="rows" :loading="loading" @view="viewItem" />
  </a-card>
</template>



<script setup lang="ts">
import { ref } from 'vue'
import { getWithDeadlines, type ClothingItemWithDeadline } from '../store/items'
import { useNavigation } from '../composables/useFormatting'
import { message } from 'ant-design-vue'
import GlobalSearch from '../components/common/GlobalSearch.vue'
import DeadlinesList from '../components/items/DeadlinesList.vue'


const owner = ref('')
const rows = ref<ClothingItemWithDeadline[]>([])
const loading = ref(false)
const { goToItem } = useNavigation()

async function load() {
  loading.value = true
  try {
    rows.value = await getWithDeadlines(owner.value || undefined)
    if (rows.value.length === 0) {
      message.info('Aucun délai à suivre.')
    }
  } catch (e) {
    message.error('Erreur lors du chargement des délais.')
  } finally {
    loading.value = false
  }
}

function viewItem(id: string) {
  goToItem(id)
}

function onSearch(filters: any) {
  owner.value = (filters?.query || '').trim()
  load()
}

function onClear() {
  owner.value = ''
  rows.value = []
}


load()
</script>
