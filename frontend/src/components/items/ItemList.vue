<template>
  <div class="item-list-container">
    <a-skeleton :loading="loading" active>
      <a-list 
        :data-source="displayItems" 
        :pagination="paginationConfig"
        item-layout="horizontal"
        :row-key="'id'"
      >
        <template #renderItem="{ item }">
          <ItemDetailCard 
            :item="item"
            :show-status-actions="showStatusActions"
            :show-deadline="showDeadlines"
            :list-mode="true"
            :loading="actionLoading === item.id"
            @view="(id) => $emit('view', id)"
            @status-change="handleStatusChange"
            @image-preview="handleImagePreview"
            @save-items="handleSaveItems"
          >
            <template #actions="{ item: cardItem }" v-if="$slots.actions">
              <slot name="actions" :item="cardItem" />
            </template>
            <template #extra="{ item: cardItem }" v-if="$slots.extra">
              <slot name="extra" :item="cardItem" />
            </template>
          </ItemDetailCard>
        </template>
      </a-list>

      <a-empty 
        v-if="!loading && displayItems.length === 0" 
        :description="emptyDescription"
        :image="emptyImage"
      >
        <template #description>
          {{ emptyDescription }}
        </template>
        <a-button 
          v-if="showCreateButton" 
          type="primary" 
          @click="$emit('create')"
        >
          {{ createButtonText }}
        </a-button>
      </a-empty>
    </a-skeleton>

    <!-- Image Preview Modal -->
    <a-modal
      v-model:open="previewVisible"
      :title="'Aperçu de l\'image'"
      :footer="null"
      centered
      width="80%"
    >
      <img 
        v-if="previewImage" 
        :src="previewImage" 
        alt="Preview" 
        style="width: 100%; max-height: 70vh; object-fit: contain;"
      />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import ItemDetailCard from './ItemDetailCard.vue'
import { useItemsStore } from '../../store/itemsStore'
import { updateItemsList } from '../../store/items'
import type { ClothingItem } from '../../store/itemsStore'

interface Props {
  items: ClothingItem[]
  loading?: boolean
  showStatusActions?: boolean
  showDeadlines?: boolean
  showCreateButton?: boolean
  createButtonText?: string
  emptyDescription?: string
  emptyImage?: string
  pageSize?: number
  showSizeChanger?: boolean
  showQuickJumper?: boolean
  serverSidePagination?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  showStatusActions: true,
  showDeadlines: false,
  showCreateButton: false,
  createButtonText: 'Créer un article',
  emptyDescription: 'Aucun article trouvé',
  emptyImage: 'default',
  pageSize: 10,
  showSizeChanger: true,
  showQuickJumper: false,
  serverSidePagination: false
})

const emit = defineEmits<{
  view: [id: string]
  statusChange: [id: string, status: 'cleaned' | 'delivered']
  imagePreview: [imageUrl: string]
  create: []
  saveItems: [id: string, items: any[]]
}>()

const itemsStore = useItemsStore()
const actionLoading = ref<string | null>(null)
const previewVisible = ref(false)
const previewImage = ref<string | null>(null)

const displayItems = computed(() => props.items)

const paginationConfig = computed(() => {
  // If using server-side pagination, disable client-side pagination
  if (props.serverSidePagination) {
    return false
  }
  
  if (props.items.length <= props.pageSize) {
    return false
  }
  
  return {
    pageSize: props.pageSize,
    showSizeChanger: props.showSizeChanger,
    showQuickJumper: props.showQuickJumper,
    pageSizeOptions: ['10', '20', '50', '100'],
    showTotal: (total: number, range: [number, number]) => 
      `${range[0]}-${range[1]} sur ${total} articles`
  }
})

async function handleStatusChange(id: string, status: 'cleaned' | 'delivered') {
  actionLoading.value = id
  
  try {
    await itemsStore.updateItemStatus(id, status)
    
    const statusText = status === 'cleaned' ? 'nettoyé' : 'livré'
    message.success(`Article marqué comme ${statusText}`)
    
    emit('statusChange', id, status)
  } catch (error) {
    console.error('Error updating status:', error)
    message.error('Erreur lors de la mise à jour du statut')
  } finally {
    actionLoading.value = null
  }
}

function handleImagePreview(imageUrl: string) {
  previewImage.value = imageUrl
  previewVisible.value = true
  emit('imagePreview', imageUrl)
}

async function handleSaveItems(id: string, items: any[]) {
  try {
    await updateItemsList(id, items)
    message.success('Articles mis à jour avec succès')
    emit('saveItems', id, items)
  } catch (error) {
    console.error('Error updating items:', error)
    message.error('Erreur lors de la mise à jour des articles')
  }
}

// Expose methods for parent components
defineExpose({
  handleImagePreview
})
</script>

<style scoped>
.item-list-container {
  width: 100%;
}

:deep(.ant-list-item) {
  border-radius: 8px;
  margin-bottom: 16px;
  background: white;
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}

:deep(.ant-list-item:hover) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-color: #d9d9d9;
}

:deep(.ant-pagination) {
  margin-top: 24px;
  text-align: center;
}

@media (max-width: 768px) {
  :deep(.ant-pagination) {
    margin-top: 16px;
  }
  
  :deep(.ant-pagination .ant-pagination-options) {
    display: none;
  }
}
</style>
