<template>
  <div class="global-search">
    <a-input-search
      v-model:value="searchQuery"
      placeholder="Rechercher par propriétaire, code article, ou statut..."
      enter-button="Rechercher"
      size="large"
      allow-clear
      @search="handleSearch"
      @clear="handleClear"
      :loading="loading"
      class="search-input"
    >
      <template #enterButton>
        <a-button type="primary" :loading="loading">
          <template #icon>
            <SearchOutlined />
          </template>
        </a-button>
      </template>
    </a-input-search>

    <!-- Advanced Filters Modal -->
    <a-button 
      type="text" 
      @click="showAdvancedFilters = true"
      class="filter-button"
      title="Filtres avancés"
    >
      <template #icon>
        <FilterOutlined />
      </template>
      Filtres
      <a-badge v-if="hasActiveFilters" :count="activeFiltersCount" />
    </a-button>

    <a-modal
      v-model:open="showAdvancedFilters"
      title="Filtres avancés"
      @ok="applyAdvancedFilters"
      @cancel="cancelAdvancedFilters"
      :confirmLoading="loading"
    >
      <a-form layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="Statut">
              <a-select
                v-model:value="filters.status"
                placeholder="Tous les statuts"
                allow-clear
                mode="multiple"
              >
                <a-select-option value="received">Reçu</a-select-option>
                <a-select-option value="cleaned">Nettoyé</a-select-option>
                <a-select-option value="delivered">Livré</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="Type d'article">
              <a-select
                v-model:value="filters.itemType"
                placeholder="Tous les types"
                allow-clear
                mode="multiple"
              >
                <a-select-option v-for="type in availableTypes" :key="type.id" :value="type.name">
                  {{ type.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="Date de réception (De)">
              <a-date-picker
                v-model:value="filters.dateReceivedFrom"
                style="width: 100%"
                placeholder="Date de début"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="Date de réception (À)">
              <a-date-picker
                v-model:value="filters.dateReceivedTo"
                style="width: 100%"
                placeholder="Date de fin"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="Date promise (De)">
              <a-date-picker
                v-model:value="filters.datePromisedFrom"
                style="width: 100%"
                placeholder="Date de début"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="Date promise (À)">
              <a-date-picker
                v-model:value="filters.datePromisedTo"
                style="width: 100%"
                placeholder="Date de fin"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="Prix minimum">
              <a-input-number
                v-model:value="filters.priceMin"
                style="width: 100%"
                placeholder="Prix minimum"
                :min="0"
                addon-after="FCFA"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="Prix maximum">
              <a-input-number
                v-model:value="filters.priceMax"
                style="width: 100%"
                placeholder="Prix maximum"
                :min="0"
                addon-after="FCFA"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item>
          <a-button @click="clearAllFilters" type="link" danger>
            Effacer tous les filtres
          </a-button>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { SearchOutlined, FilterOutlined } from '@ant-design/icons-vue'
import { getTypes } from '../../store/types'
import type { Dayjs } from 'dayjs'

export interface SearchFilters {
  query: string
  status: string[]
  itemType: string[]
  dateReceivedFrom: Dayjs | null
  dateReceivedTo: Dayjs | null
  datePromisedFrom: Dayjs | null
  datePromisedTo: Dayjs | null
  priceMin: number | null
  priceMax: number | null
}

const emit = defineEmits<{
  search: [filters: SearchFilters]
  clear: []
}>()

const searchQuery = ref('')
const loading = ref(false)
const showAdvancedFilters = ref(false)
const availableTypes = getTypes()

const filters = ref<SearchFilters>({
  query: '',
  status: [],
  itemType: [],
  dateReceivedFrom: null,
  dateReceivedTo: null,
  datePromisedFrom: null,
  datePromisedTo: null,
  priceMin: null,
  priceMax: null
})

const hasActiveFilters = computed(() => {
  return filters.value.status.length > 0 ||
         filters.value.itemType.length > 0 ||
         filters.value.dateReceivedFrom ||
         filters.value.dateReceivedTo ||
         filters.value.datePromisedFrom ||
         filters.value.datePromisedTo ||
         filters.value.priceMin !== null ||
         filters.value.priceMax !== null
})

const activeFiltersCount = computed(() => {
  let count = 0
  if (filters.value.status.length > 0) count++
  if (filters.value.itemType.length > 0) count++
  if (filters.value.dateReceivedFrom || filters.value.dateReceivedTo) count++
  if (filters.value.datePromisedFrom || filters.value.datePromisedTo) count++
  if (filters.value.priceMin !== null || filters.value.priceMax !== null) count++
  return count
})

function handleSearch() {
  filters.value.query = searchQuery.value
  emit('search', { ...filters.value })
}

function handleClear() {
  searchQuery.value = ''
  filters.value.query = ''
  emit('clear')
}

function applyAdvancedFilters() {
  filters.value.query = searchQuery.value
  showAdvancedFilters.value = false
  emit('search', { ...filters.value })
}

function cancelAdvancedFilters() {
  showAdvancedFilters.value = false
}

function clearAllFilters() {
  filters.value = {
    query: searchQuery.value,
    status: [],
    itemType: [],
    dateReceivedFrom: null,
    dateReceivedTo: null,
    datePromisedFrom: null,
    datePromisedTo: null,
    priceMin: null,
    priceMax: null
  }
}

// Expose loading state control
defineExpose({
  setLoading: (value: boolean) => {
    loading.value = value
  }
})
</script>

<style scoped>
.global-search {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.search-input {
  flex: 1;
}

.filter-button {
  white-space: nowrap;
  color: #fff !important;
  border-color: rgba(255, 255, 255, 0.3) !important;
  background: rgba(255, 255, 255, 0.05) !important;
}

.filter-button:hover {
  color: rgba(255, 255, 255, 0.8) !important;
  background: rgba(255, 255, 255, 0.1) !important;
  border-color: rgba(255, 255, 255, 0.5) !important;
}

@media (max-width: 768px) {
  .global-search {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px;
    align-items: stretch;
  }
  
  .search-input {
    flex: 1;
    min-width: 200px;
  }
  
  .filter-button {
    flex-shrink: 0;
    background: rgba(255, 255, 255, 0.1) !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    color: #fff !important;
    padding: 8px 12px !important;
    height: 40px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }
}
</style>
