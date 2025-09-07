<template>
  <a-card title="Rechercher des articles" :bordered="false">
    <!-- Search Form -->
    <a-form @submit.prevent="performSearch" layout="vertical">
      <a-row :gutter="[16, 16]">
        <a-col :xs="24" :sm="12" :lg="8">
          <a-form-item label="Code article">
            <a-input 
              v-model:value="searchParams.code" 
              placeholder="Code de l'article" 
              allow-clear
              @press-enter="performSearch"
            />
          </a-form-item>
        </a-col>
        <a-col :xs="24" :sm="12" :lg="8">
          <a-form-item label="Propriétaire">
            <a-input 
              v-model:value="searchParams.owner" 
              placeholder="Nom du propriétaire" 
              allow-clear
              @press-enter="performSearch"
            />
          </a-form-item>
        </a-col>
        <a-col :xs="24" :sm="12" :lg="8">
          <a-form-item label="Statut">
            <a-select 
              v-model:value="searchParams.status" 
              placeholder="Tous les statuts"
              allow-clear
            >
              <a-select-option value="received">Reçu</a-select-option>
              <a-select-option value="cleaned">Nettoyé</a-select-option>
              <a-select-option value="delivered">Livré</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
      
      <a-row :gutter="[16, 16]">
        <a-col :xs="24" :sm="24" :lg="24">
          <a-form-item>
            <a-space>
              <a-button @click="clearSearch" :disabled="loading">
                Effacer
              </a-button>
              <a-button type="primary" @click="performSearch" :loading="loading">
                Rechercher
              </a-button>
            </a-space>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>

    <!-- Results -->
    <a-skeleton :loading="loading" active>
      <div v-if="singleItem && item">
        <!-- Single Item Details (when searching by exact code) -->
        <a-card :title="'Détails de l\'article ' + item.id" class="item-details-card">
          <template #extra>
            <a-tag :color="statusColor(item.status)">{{ item.status }}</a-tag>
          </template>

          <div v-if="item.image" class="item-image-wrapper">
            <img :src="item.image" alt="Photo vêtement" class="item-image" />
          </div>

          <a-descriptions :column="1" size="small" bordered>
            <a-descriptions-item label="Propriétaire"><strong>{{ item.owner }}</strong></a-descriptions-item>
            <a-descriptions-item label="Contact">{{ item.contact || 'N/A' }}</a-descriptions-item>
            <a-descriptions-item label="Prix">{{ item.price }} FCFA</a-descriptions-item>
            <a-descriptions-item label="Montant Payé" v-if="item.amountGiven">{{ item.amountGiven }}
              FCFA</a-descriptions-item>
            <a-descriptions-item label="Monnaie" v-if="item.amountGiven && item.amountGiven >= item.price">{{
              item.amountGiven -
              item.price }} FCFA</a-descriptions-item>
            <a-descriptions-item label="Reçu le">{{ formatDate(item.date_received) }}</a-descriptions-item>
            <a-descriptions-item v-if="item.date_promised" label="Promis pour le">{{ formatDate(item.date_promised)
            }}</a-descriptions-item>
            <a-descriptions-item v-if="item.date_cleaned" label="Nettoyé le">{{ formatDate(item.date_cleaned)
            }}</a-descriptions-item>
            <a-descriptions-item v-if="item.date_delivered" label="Livré le">{{ formatDate(item.date_delivered)
            }}</a-descriptions-item>
          </a-descriptions>

          <div v-if="item.items && item.items.length" style="margin-top: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <strong>Articles :</strong>
              <a-button v-if="!isEditing && item.status !== 'delivered'" 
                size="small" 
                @click="startEditing"
                :disabled="loading">
                Modifier
              </a-button>
            </div>

            <!-- View mode -->
            <a-list v-if="!isEditing" size="small">
              <a-list-item v-for="(line, i) in item.items" :key="i">
                {{ line.qty }} × {{ line.type }}
                <span v-if="line.notes" style="color: #888; margin-left: 8px;">({{ line.notes }})</span>
              </a-list-item>
            </a-list>

            <!-- Edit mode -->
            <div v-else>
              <div v-for="(editItem, idx) in editingItems" :key="idx" class="edit-item-row">
                <a-select v-model:value="editItem.type" placeholder="Type" style="flex: 2;">
                  <a-select-option v-for="t in types" :key="t.id" :value="t.name">{{ t.name }}</a-select-option>
                </a-select>
                <a-input-number v-model:value="editItem.qty" :min="1" placeholder="Qté" style="flex: 1;" />
                <a-input v-model:value="editItem.notes" placeholder="Note" style="flex: 2;" />
                <a-button danger @click="removeEditItem(idx)" :disabled="editingItems.length === 1" size="small">
                  <template #icon>
                    <DeleteOutlined />
                  </template>
                </a-button>
              </div>
              
              <a-button type="dashed" block @click="addEditItem" style="margin-top: 8px; margin-bottom: 16px;">
                <template #icon>
                  <PlusOutlined />
                </template>
                Ajouter un article
              </a-button>

              <a-space>
                <a-button type="primary" @click="saveItemsChanges" :loading="loading">
                  Sauvegarder
                </a-button>
                <a-button @click="cancelEditing" :disabled="loading">
                  Annuler
                </a-button>
              </a-space>
            </div>
          </div>

          <a-space style="margin-top: 16px; width: 100%; justify-content: center;">
            <a-button v-if="item.status === 'received'" type="primary" @click="markClean" size="large"
              :loading="loading" :disabled="loading" aria-label="Marquer comme nettoyé">Marquer comme Nettoyé</a-button>
            <a-button v-if="item.status === 'cleaned'" type="primary" @click="markDelivered" size="large"
              :loading="loading" :disabled="loading" aria-label="Marquer comme livré">Marquer comme Livré</a-button>
          </a-space>
        </a-card>
      </div>

      <!-- Multiple Results -->
      <div v-else-if="searchResults.length > 0">
        <a-card :title="`${searchResults.length} article(s) trouvé(s)`" :bordered="false">
          <ItemList 
            :items="searchResults" 
            :loading="loading" 
            :show-status-actions="true"
            :show-deadlines="true"
            @view="viewItem"
            @status-change="handleStatusChange"
          />
        </a-card>
      </div>

      <a-empty v-else-if="searched" description="Aucun article trouvé." />
    </a-skeleton>
  </a-card>
</template>


<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getById, getAll, updateStatus, updateItemsList, type ClothingItem, type ItemLine } from '../store/items'
import { getTypes } from '../store/types'
import { useFormatting } from '../composables/useFormatting'
import { message } from 'ant-design-vue'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import ItemList from '../components/items/ItemList.vue'

// Search parameters
const searchParams = ref({
  code: '',
  owner: '',
  status: undefined as string | undefined
})

// State
const item = ref<ClothingItem | undefined>()
const searchResults = ref<ClothingItem[]>([])
const loading = ref(false)
const searched = ref(false)
const singleItem = ref(false)
const route = useRoute()
const router = useRouter()
const { formatDate, statusColor } = useFormatting()

// Editing state
const isEditing = ref(false)
const editingItems = ref<ItemLine[]>([])
const types = getTypes()

onMounted(() => {
  if (route.query.id && typeof route.query.id === 'string') {
    searchParams.value.code = route.query.id
    performSearch()
  }
})

async function performSearch() {
  if (!hasSearchCriteria()) {
    message.warning('Veuillez entrer au moins un critère de recherche.')
    return
  }

  loading.value = true
  searched.value = true
  singleItem.value = false
  searchResults.value = []
  item.value = undefined

  try {
    // If searching by exact code, try to get single item first
    if (searchParams.value.code && !searchParams.value.owner && !searchParams.value.status) {
      const singleResult = await getById(searchParams.value.code)
      if (singleResult) {
        item.value = singleResult
        singleItem.value = true
        return
      }
    }

    // Otherwise, perform multi-criteria search
    const allItems = await getAll()
    let filtered = allItems

    // Filter by code (partial match)
    if (searchParams.value.code) {
      filtered = filtered.filter(item => 
        item.id.toLowerCase().includes(searchParams.value.code.toLowerCase())
      )
    }

    // Filter by owner (partial match)
    if (searchParams.value.owner) {
      filtered = filtered.filter(item => 
        item.owner.toLowerCase().includes(searchParams.value.owner.toLowerCase())
      )
    }

    // Filter by status
    if (searchParams.value.status) {
      filtered = filtered.filter(item => item.status === searchParams.value.status)
    }

    searchResults.value = filtered

    if (filtered.length === 0) {
      message.info('Aucun article trouvé pour ces critères.')
    } else if (filtered.length === 1) {
      // If only one result, show it as single item
      item.value = filtered[0]
      singleItem.value = true
      searchResults.value = []
    }

  } catch (e) {
    console.error('Search error:', e)
    message.error('Erreur lors de la recherche.')
  } finally {
    loading.value = false
  }
}

function hasSearchCriteria(): boolean {
  return !!(
    searchParams.value.code ||
    searchParams.value.owner ||
    searchParams.value.status
  )
}

function clearSearch() {
  searchParams.value = {
    code: '',
    owner: '',
    status: undefined
  }
  item.value = undefined
  searchResults.value = []
  searched.value = false
  singleItem.value = false
}

function viewItem(id: string) {
  router.push({ path: '/item', query: { id } })
}

function handleStatusChange(_id: string, _status: 'cleaned' | 'delivered') {
  // Refresh search results after status change
  setTimeout(() => {
    performSearch()
  }, 500)
}

async function updateAndRefresh(id: string, status: 'cleaned' | 'delivered') {
  loading.value = true;
  try {
    const updatedItem = await updateStatus(id, status);
    if (updatedItem) {
      item.value = updatedItem;
      message.success(status === 'cleaned' ? 'Article marqué comme nettoyé.' : 'Article marqué comme livré.')
    } else {
      message.error("Impossible de mettre à jour l'article.")
    }
  } catch (e) {
    message.error("Erreur lors de la mise à jour du statut.")
  } finally {
    loading.value = false;
  }
}

async function markClean() {
  if (!item.value) return;
  await updateAndRefresh(item.value.id, 'cleaned');
}

async function markDelivered() {
  if (!item.value) return;
  await updateAndRefresh(item.value.id, 'delivered');
}

// Editing functions
function startEditing() {
  if (!item.value?.items) return
  // Clone the current items for editing
  editingItems.value = item.value.items.map(i => ({
    type: i.type,
    qty: i.qty,
    notes: i.notes || ''
  }))
  isEditing.value = true
}

function cancelEditing() {
  isEditing.value = false
  editingItems.value = []
}

function addEditItem() {
  editingItems.value.push({
    type: types.value[0]?.name || '',
    qty: 1,
    notes: ''
  })
}

function removeEditItem(index: number) {
  if (editingItems.value.length > 1) {
    editingItems.value.splice(index, 1)
  }
}

async function saveItemsChanges() {
  if (!item.value) return
  
  // Validate at least one valid item
  const validItems = editingItems.value.filter(i => i.type && i.type.trim())
  if (validItems.length === 0) {
    message.warning('Au moins un article doit être spécifié.')
    return
  }

  loading.value = true
  try {
    const updatedItem = await updateItemsList(item.value.id, editingItems.value)
    if (updatedItem) {
      item.value = updatedItem
      isEditing.value = false
      editingItems.value = []
      message.success('Articles mis à jour avec succès.')
    }
  } catch (error: any) {
    message.error(error.message || 'Erreur lors de la mise à jour des articles.')
  } finally {
    loading.value = false
  }
}


</script>

<style scoped>
.item-details-card {
  margin-top: 16px;
}

.item-image-wrapper {
  text-align: center;
  margin-bottom: 16px;
}

.item-image {
  max-width: 100%;
  max-height: 250px;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

.edit-item-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}
</style>
