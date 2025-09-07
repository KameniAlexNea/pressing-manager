<template>
  <a-card title="Liste des Articles" :bordered="false">
    <a-tabs v-model:activeKey="statusTab" centered>
      <a-tab-pane key="received" tab="Reçus" />
      <a-tab-pane key="cleaned" tab="Nettoyés" />
      <a-tab-pane key="delivered" tab="Livrés" />
    </a-tabs>

    <ItemList
      :items="filteredItems"
      :loading="itemsStore.loading"
      :show-status-actions="true"
      :show-deadlines="true"
      :empty-description="emptyDescription"
      @view="viewItem"
      @status-change="handleStatusChange"
      @image-preview="handleImagePreview"
    />
  </a-card>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useItemsStore } from '../store/itemsStore'
import { useNavigation } from '../composables/useFormatting'
import { message } from 'ant-design-vue'
import ItemList from '../components/items/ItemList.vue'

const itemsStore = useItemsStore()
const { goToItem } = useNavigation()
const statusTab = ref<'received' | 'cleaned' | 'delivered'>('received')

const filteredItems = computed(() => {
  // Use filtered items from store if search is active, otherwise filter by status
  const items = itemsStore.filteredItems.length > 0 || hasActiveSearch.value 
    ? itemsStore.filteredItems 
    : itemsStore.items

  return items
    .filter(item => item.status === statusTab.value)
    .sort((a, b) => new Date(b.date_received).getTime() - new Date(a.date_received).getTime())
})

const hasActiveSearch = computed(() => {
  const filters = itemsStore.searchFilters
  return !!(filters.query || 
           filters.status.length > 0 || 
           filters.itemType.length > 0 ||
           filters.dateReceivedFrom ||
           filters.dateReceivedTo ||
           filters.datePromisedFrom ||
           filters.datePromisedTo ||
           filters.priceMin ||
           filters.priceMax)
})

const emptyDescription = computed(() => {
  const statusLabels = {
    received: 'reçus',
    cleaned: 'nettoyés', 
    delivered: 'livrés'
  }
  
  if (hasActiveSearch.value) {
    return `Aucun article ${statusLabels[statusTab.value]} ne correspond à votre recherche.`
  }
  
  return `Aucun article ${statusLabels[statusTab.value]} pour le moment.`
})

async function loadItems() {
  try {
    await itemsStore.fetchAllItems()
  } catch (error) {
    console.error('Error loading items:', error)
    message.error('Erreur lors du chargement des articles.')
  }
}

function viewItem(id: string) {
  goToItem(id)
}

function handleStatusChange(id: string, status: 'cleaned' | 'delivered') {
  // The ItemList component handles the status update and shows success/error messages
  console.log(`Status changed for item ${id} to ${status}`)
}

function handleImagePreview(imageUrl: string) {
  console.log('Image preview:', imageUrl)
}

// Watch for tab changes to show appropriate empty messages
watch(statusTab, () => {
  // Items are already filtered by the computed property
}, { immediate: true })

// Load items on component mount
onMounted(() => {
  loadItems()
})
</script>
