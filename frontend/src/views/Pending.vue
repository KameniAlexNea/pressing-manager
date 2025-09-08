<template>
  <div class="pending-container">
    <a-card title="Articles" :bordered="false" class="mobile-card">
      <!-- Mobile-Optimized Status Tabs -->
      <div class="status-tabs-mobile">
        <a-radio-group
          v-model:value="statusTab"
          button-style="solid"
          size="large"
          class="status-radio-group"
        >
          <a-radio-button value="received" class="status-tab">
            <div class="tab-content">
              <span class="tab-label">Reçus</span>
              <a-badge :count="statusCounts.received" :number-style="{ backgroundColor: '#1890ff' }" />
            </div>
          </a-radio-button>
          <a-radio-button value="cleaned" class="status-tab">
            <div class="tab-content">
              <span class="tab-label">Nettoyés</span>
              <a-badge :count="statusCounts.cleaned" :number-style="{ backgroundColor: '#52c41a' }" />
            </div>
          </a-radio-button>
          <a-radio-button value="delivered" class="status-tab">
            <div class="tab-content">
              <span class="tab-label">Livrés</span>
              <a-badge :count="statusCounts.delivered" :number-style="{ backgroundColor: '#722ed1' }" />
            </div>
          </a-radio-button>
        </a-radio-group>
      </div>

      <!-- Items List -->
      <div class="items-section">
        <ItemList
          :items="displayedItems"
          :loading="itemsStore.loading"
          :show-status-actions="true"
          :show-deadlines="statusTab === 'received'"
          :empty-description="emptyDescription"
          :page-size="pageSize"
          :show-size-changer="false"
          :show-quick-jumper="false"
          :server-side-pagination="false"
          @view="viewItem"
          @status-change="handleStatusChange"
          @image-preview="handleImagePreview"
        />
      </div>

      <!-- Mobile-Optimized Pagination -->
      <div v-if="statusPagination.total > pageSize" class="pagination-mobile">
        <a-pagination
          v-model:current="currentPage"
          :total="statusPagination.total"
          :page-size="pageSize"
          :show-size-changer="false"
          :show-quick-jumper="false"
          size="small"
          @change="onPageChange"
        />
      </div>
    </a-card>
  </div>
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

// Compute status counts for badges and stats
const statusCounts = computed(() => ({
  received: itemsStore.items.filter(item => item.status === 'received').length,
  cleaned: itemsStore.items.filter(item => item.status === 'cleaned').length,
  delivered: itemsStore.items.filter(item => item.status === 'delivered').length
}))

// Display items are filtered from all items in store (client-side filtering for status)
const displayedItems = computed(() => {
  const statusItems = itemsStore.items.filter(item => item.status === statusTab.value)

  // Apply client-side pagination
  const currentPageValue = currentPage.value
  const pageSizeValue = pageSize.value
  const startIndex = (currentPageValue - 1) * pageSizeValue
  const endIndex = startIndex + pageSizeValue

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

function handleStatusChange(_id: string, _status: 'cleaned' | 'delivered') {
  // After status change, reload all items to refresh the cache
  setTimeout(() => {
    itemsStore.fetchAllItems(true) // Force refresh
  }, 500)
}

function handleImagePreview(imageUrl: string) {
  console.log('Image preview:', imageUrl)
}

// Handle pagination changes (client-side only)
function onPageChange(page: number) {
  currentPage.value = page
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
.pending-container {
  padding: 16px;
}

.status-tabs-mobile {
  margin-bottom: 16px;
}

.items-section {
  margin-top: 16px;
}

.pagination-mobile {
  margin-top: 20px;
  text-align: center;
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .pending-container {
    padding: 8px;
  }
}
</style>
