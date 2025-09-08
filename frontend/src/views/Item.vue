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
        <ItemDetailCard
          :item="item"
          :loading="loading"
          :show-actions="true"
          :list-mode="false"
          @status-change="handleStatusChange"
          @save-items="handleSaveItems"
        />
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
import { message } from 'ant-design-vue'
import ItemList from '../components/items/ItemList.vue'
import ItemDetailCard from '../components/items/ItemDetailCard.vue'

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
    // If searching by code (any code), try to get single item first
    if (searchParams.value.code) {
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

async function handleStatusChange(id: string, status: 'cleaned' | 'delivered') {
  loading.value = true
  try {
    const updatedItem = await updateStatus(id, status)
    if (updatedItem) {
      item.value = updatedItem
      message.success(status === 'cleaned' ? 'Article marqué comme nettoyé.' : 'Article marqué comme livré.')
    } else {
      message.error("Impossible de mettre à jour l'article.")
    }
  } catch (e) {
    message.error("Erreur lors de la mise à jour du statut.")
  } finally {
    loading.value = false
  }
}

async function handleSaveItems(id: string, items: ItemLine[]) {
  loading.value = true
  try {
    const updatedItem = await updateItemsList(id, items)
    if (updatedItem) {
      item.value = updatedItem
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
</style>
