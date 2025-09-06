<template>
  <a-card title="Recherche par Propriétaire" :bordered="false">
    <a-form @submit.prevent="load">
      <a-form-item>
        <a-input-search v-model:value="owner" placeholder="Entrez le nom du propriétaire" enter-button="Rechercher"
          size="large" @search="load" :loading="loading" :disabled="loading" aria-label="Recherche propriétaire" />
      </a-form-item>
    </a-form>

    <a-skeleton :loading="loading" active>
  <a-list v-if="searched" item-layout="horizontal" :data-source="rows" :row-key="'id'" :pagination="{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['5', '10', '20', '50'] }">
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
import { getByOwner, type ClothingItem } from '../store/items'
import { useFormatting, useNavigation } from '../composables/useFormatting'
import { message } from 'ant-design-vue'


const owner = ref('')
const rows = ref<ClothingItem[]>([])
const loading = ref(false)
const searched = ref(false)
const { formatDate, statusColor } = useFormatting()
const { goToItem } = useNavigation()

async function load() {
  if (!owner.value) {
    message.warning('Veuillez entrer le nom du propriétaire.')
    return
  }
  loading.value = true
  searched.value = true
  try {
    rows.value = await getByOwner(owner.value)
    if (rows.value.length === 0) {
      message.info('Aucun article trouvé pour ce propriétaire.')
    }
  } catch (e) {
    message.error('Erreur lors de la recherche.')
  } finally {
    loading.value = false
  }
}

function viewItem(id: string) {
  goToItem(id)
}


</script>
