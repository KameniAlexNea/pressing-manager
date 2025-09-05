<template>
  <a-card title="Articles en attente">
    <a-space>
      <a-input-number v-model:value="days" :min="0" />
      <a-button type="primary" @click="load">Rechercher</a-button>
    </a-space>
    <a-table :columns="columns" :data-source="rows" :row-key="'id'" style="margin-top:12px" />
  </a-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { getPendingOlderThan } from '../store/items'

const days = ref<number>(7)
const rows = ref<any[]>([])
const columns = [
  { title: 'ID', dataIndex: 'id' },
  { title: 'Description', dataIndex: 'description' },
  { title: 'Propriétaire', dataIndex: 'owner' },
  { title: 'Contact', dataIndex: 'contact' },
  { title: 'Prix', dataIndex: 'price' },
  { title: 'Statut', dataIndex: 'status' },
  { title: 'Reçu', dataIndex: 'date_received' },
  { title: 'Promis', dataIndex: 'date_promised' },
]

async function load() { rows.value = await getPendingOlderThan(days.value) }
load()
</script>
