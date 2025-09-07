<template>
  <a-card title="Recherche par Propriétaire" :bordered="false">
    <a-input-search
      v-model:value="owner"
      placeholder="Entrez le nom du propriétaire..."
      enter-button="Rechercher"
      size="large"
      allow-clear
      @search="handleSearch"
      @clear="handleClear"
      :loading="loading"
      class="search-input"
    />
    <OwnerList v-if="searched" :rows="rows" :loading="loading" @view="viewItem" />
    <a-empty v-if="searched && !loading && rows.length === 0" description="Aucun article trouvé pour ce propriétaire." />
  </a-card>
</template>



<script setup lang="ts">
import { ref } from 'vue'
import { getByOwner, type ClothingItem } from '../store/items'
import { useNavigation } from '../composables/useFormatting'
import { message } from 'ant-design-vue'
import OwnerList from '../components/items/OwnerList.vue'


const owner = ref('')
const rows = ref<ClothingItem[]>([])
const loading = ref(false)
const searched = ref(false)
const { goToItem } = useNavigation()

async function load() {
  if (!owner.value) {
    message.warning('Veuillez entrer le nom du propriétaire.')
    return
  }
  loading.value = true
  searched.value = true
  try {
    console.log('Searching for owner:', owner.value)
    rows.value = await getByOwner(owner.value)
    console.log('Search results:', rows.value)
    console.log('Results length:', rows.value.length)
    if (rows.value.length === 0) {
      message.info('Aucun article trouvé pour ce propriétaire.')
    }
  } catch (e) {
    console.error('Search error:', e)
    message.error('Erreur lors de la recherche.')
  } finally {
    loading.value = false
  }
}

function viewItem(id: string) {
  goToItem(id)
}

function handleSearch() {
  searched.value = false
  load()
}

function handleClear() {
  owner.value = ''
  rows.value = []
  searched.value = false
}


</script>

<style scoped>
.search-input {
  margin-bottom: 16px;
}
</style>
