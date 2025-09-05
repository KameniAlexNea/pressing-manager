<template>
  <a-card title="Voir un article" style="max-width:600px;margin:auto">
    <a-form layout="vertical" @submit.prevent>
      <a-form-item label="Code">
        <a-input v-model:value="code" />
      </a-form-item>
      <a-space>
        <a-button type="primary" @click="lookup">Rechercher</a-button>
      </a-space>
    </a-form>
    <a-divider />
    <div v-if="item">
      <a-descriptions bordered size="small" :column="1">
        <a-descriptions-item label="ID">{{ item.id }}</a-descriptions-item>
        <a-descriptions-item label="Propriétaire">{{ item.owner }}</a-descriptions-item>
        <a-descriptions-item label="Contact">{{ item.contact || 'N/A' }}</a-descriptions-item>
        <a-descriptions-item label="Prix">{{ item.price }}</a-descriptions-item>
        <a-descriptions-item label="Montant donné" v-if="item.amountGiven">{{ item.amountGiven }}</a-descriptions-item>
        <a-descriptions-item label="Monnaie à rendre" v-if="item.amountGiven && item.amountGiven >= item.price">{{ item.amountGiven - item.price }}</a-descriptions-item>
        <a-descriptions-item label="Statut">{{ item.status }}</a-descriptions-item>
        <a-descriptions-item label="Reçu">{{ item.date_received }}</a-descriptions-item>
        <a-descriptions-item label="Nettoyé">{{ item.date_cleaned || 'N/A' }}</a-descriptions-item>
        <a-descriptions-item label="Livré">{{ item.date_delivered || 'N/A' }}</a-descriptions-item>
        <a-descriptions-item label="Promis">{{ item.date_promised || 'N/A' }}</a-descriptions-item>
        <a-descriptions-item label="Notes">{{ item.notes || 'N/A' }}</a-descriptions-item>
      </a-descriptions>
      <div v-if="item.items && item.items.length" style="margin: 1em 0;">
        <strong>Détail des articles :</strong>
        <ul style="margin: 0.5em 0 0 1em;">
          <li v-for="(line, i) in item.items" :key="i">
            {{ line.qty }} × {{ line.type }}<span v-if="line.notes"> ({{ line.notes }})</span>
          </li>
        </ul>
      </div>
      <div v-if="item.image && item.status === 'received'" style="margin: 1em 0; text-align: center;">
        <img :src="item.image" alt="Photo vêtement" style="max-width: 200px; max-height: 200px; border: 1px solid #ccc;" />
      </div>
      <a-space style="margin-top:8px">
        <a-button v-if="item.status==='received'" @click="markClean">Marquer nettoyé</a-button>
        <a-button v-if="item.status==='cleaned'" type="primary" @click="markDelivered">Marquer livré</a-button>
      </a-space>
    </div>
  </a-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { getById, updateStatus, type ClothingItem } from '../store/items'

const code = ref('')
const item = ref<ClothingItem | undefined>()

async function lookup() { item.value = await getById(code.value) }
async function markClean() { if (!item.value) return; item.value = await updateStatus(item.value.id, 'cleaned') }
async function markDelivered() { if (!item.value) return; item.value = await updateStatus(item.value.id, 'delivered') }
</script>
