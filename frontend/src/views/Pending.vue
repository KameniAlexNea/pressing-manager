<template>
  <a-card title="Liste des Articles" :bordered="false">
    <a-tabs v-model:activeKey="statusTab" centered @change="onTabChange">
      <a-tab-pane key="received" tab="Reçus" />
      <a-tab-pane key="cleaned" tab="Nettoyés" />
      <a-tab-pane key="delivered" tab="Livrés" />
    </a-tabs>

    <ItemList
      :items="displayedItems"
      :loading="itemsStore.loading"
      :show-status-actions="true"
      :show-deadlines="true"
      :empty-description="emptyDescription"
      :page-size="itemsStore.pagination.pageSize"
      :show-size-changer="false"
      :show-quick-jumper="false"
      :server-side-pagination="true"
      @view="viewItem"
      @status-change="handleStatusChange"
      @image-preview="handleImagePreview"
    />

    <!-- Client-side Pagination for Status Filtering -->
    <div v-if="statusPagination.total > pageSize" class="pagination-container">
      <a-pagination
        v-model:current="currentPage"
        v-model:page-size="pageSize"
        :total="statusPagination.total"
        :show-size-changer="true"
        :show-quick-jumper="true"
        :show-total="(total: number, range: [number, number]) => `${range[0]}-${range[1]} sur ${total} articles`"
        :page-size-options="['10', '20', '50', '100']"
        @change="onPageChange"
        @show-size-change="onPageSizeChange"
      />
    </div>
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
const currentPage = ref(1)
const pageSize = ref(20)

// Display items are filtered from all items in store (client-side filtering for status)
const displayedItems = computed(() => {
  const statusItems = itemsStore.items.filter(item => item.status === statusTab.value)
  
  // Apply client-side pagination
  const pageSize = itemsStore.pagination.pageSize
  const currentPageValue = currentPage.value
  const startIndex = (currentPageValue - 1) * pageSize
  const endIndex = startIndex + pageSize
  
  return statusItems.slice(startIndex, endIndex)
})

// Compute pagination info for current status
const statusPagination = computed(() => {
  const statusItems = itemsStore.items.filter(item => item.status === statusTab.value)
  const pageSize = itemsStore.pagination.pageSize
  const totalPages = Math.ceil(statusItems.length / pageSize)
  
  return {
    total: statusItems.length,
    current: currentPage.value,
    pageSize,
    hasNextPage: currentPage.value < totalPages,
    hasPreviousPage: currentPage.value > 1,
    totalPages
  }
})

const emptyDescription = computed(() => {
  const statusLabels = {
    received: 'reçus',
    cleaned: 'nettoyés', 
    delivered: 'livrés'
  }
  
  return itemsStore.loading 
    ? 'Chargement...' 
    : `Aucun article ${statusLabels[statusTab.value]} pour le moment.`
})

function viewItem(id: string) {
  goToItem(id)
}

function handleStatusChange(id: string, status: 'cleaned' | 'delivered') {
  // After status change, reload all items to refresh the cache
  setTimeout(() => {
    itemsStore.fetchAllItems(true) // Force refresh
  }, 500)
}

function handleImagePreview(imageUrl: string) {
  console.log('Image preview:', imageUrl)
}

// Handle tab changes
async function onTabChange(activeKey: string) {
  statusTab.value = activeKey as 'received' | 'cleaned' | 'delivered'
  currentPage.value = 1 // Reset to first page when switching tabs
  // No need to fetch again since all items are already loaded
}

// Handle pagination changes (client-side only)
function onPageChange(page: number) {
  currentPage.value = page
  // No network request needed - pagination is handled by computed properties
}

function onPageSizeChange(current: number, size: number) {
  pageSize.value = size
  currentPage.value = 1 // Reset to first page when changing page size
  // No network request needed - pagination is handled by computed properties
}

// Load items on component mount
onMounted(async () => {
  // Load all items once - they'll be filtered client-side by status
  try {
    await itemsStore.fetchAllItems()
  } catch (error) {
    console.error('Error loading items:', error)
    message.error('Erreur lors du chargement des articles.')
  }
})

// Watch for status changes to keep pagination in sync
watch(() => statusTab.value, () => {
  // Update pagination current page to reflect the status tab
  currentPage.value = itemsStore.pagination.currentPage || 1
}, { immediate: true })
</script>

<style scoped>
.pagination-container {
  margin-top: 24px;
  text-align: center;
}

@media (max-width: 768px) {
  .pagination-container {
    margin-top: 16px;
  }
  
  :deep(.ant-pagination .ant-pagination-options) {
    display: none;
  }
}
</style>
