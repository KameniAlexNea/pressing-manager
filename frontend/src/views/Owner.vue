<template>
  <a-card title="Articles par propriétaire">
    <a-space>
      <a-input v-model:value="owner" placeholder="Nom" />
      <a-button type="primary" @click="load">Rechercher</a-button>
    </a-space>
    <a-table :columns="columns" :data-source="rows" :row-key="'id'" style="margin-top:12px" />
  </a-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { getByOwner } from '../store/items'

const owner = ref('')
const rows = ref<any[]>([])
const columns = [
  { title: 'ID', dataIndex: 'id' },
  { title: 'Description', dataIndex: 'description' },
  { title: 'Contact', dataIndex: 'contact' },
  { title: 'Prix', dataIndex: 'price' },
  { title: 'Statut', dataIndex: 'status' },
  { title: 'Reçu', dataIndex: 'date_received' },
  { title: 'Promis', dataIndex: 'date_promised' },
]

async function load() { rows.value = owner.value ? await getByOwner(owner.value) : [] }
</script>
