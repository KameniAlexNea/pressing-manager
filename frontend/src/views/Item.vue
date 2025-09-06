<template>
  <a-card title="Rechercher un article" :bordered="false">
    <a-form @submit.prevent="lookup">
      <a-form-item>
        <a-input-search v-model:value="code" placeholder="Entrez le code de l'article" enter-button="Rechercher"
          size="large" @search="lookup" :loading="loading" :disabled="loading" aria-label="Recherche code article" />
      </a-form-item>
    </a-form>

    <a-skeleton :loading="loading" active>
      <div v-if="item">
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
            <strong>Articles :</strong>
            <a-list size="small">
              <a-list-item v-for="(line, i) in item.items" :key="i">
                {{ line.qty }} × {{ line.type }}
                <span v-if="line.notes" style="color: #888; margin-left: 8px;">({{ line.notes }})</span>
              </a-list-item>
            </a-list>
          </div>

          <a-space style="margin-top: 16px; width: 100%; justify-content: center;">
            <a-button v-if="item.status === 'received'" type="primary" @click="markClean" size="large" :loading="loading" :disabled="loading" aria-label="Marquer comme nettoyé">Marquer comme Nettoyé</a-button>
            <a-button v-if="item.status === 'cleaned'" type="primary" @click="markDelivered" size="large" :loading="loading" :disabled="loading" aria-label="Marquer comme livré">Marquer comme Livré</a-button>
          </a-space>
        </a-card>
      </div>
      <a-empty v-else-if="searched" description="Aucun article trouvé pour ce code." />
    </a-skeleton>
  </a-card>
</template>


<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getById, updateStatus, type ClothingItem, type ItemLine } from '../store/items'
import { useFormatting } from '../composables/useFormatting'
import { message } from 'ant-design-vue'


const code = ref('')
const item = ref<ClothingItem | undefined>()
const loading = ref(false)
const searched = ref(false)
const route = useRoute()
const { formatDate, statusColor } = useFormatting()

onMounted(() => {
  if (route.query.id && typeof route.query.id === 'string') {
    code.value = route.query.id
    lookup()
  }
})

async function lookup() {
  if (!code.value) return;
  loading.value = true
  searched.value = true
  try {
    item.value = await getById(code.value)
    if (!item.value) {
      message.warning("Aucun article trouvé pour ce code.")
    }
  } catch (e) {
    message.error("Erreur lors de la recherche de l'article.")
  } finally {
    loading.value = false
  }
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
</style>
