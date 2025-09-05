<template>
  <a-card title="Gérer les délais">
    <a-space>
      <a-input v-model:value="owner" placeholder="Propriétaire (optionnel)" />
      <a-button type="primary" @click="load">Rechercher</a-button>
    </a-space>
    <a-table :columns="columns" :data-source="rows" :row-key="'id'" style="margin-top:12px"
      :row-class-name="rowClass" />
  </a-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { getWithDeadlines } from '../store/items'

const owner = ref('')
const rows = ref<any[]>([])
const columns = [
  { title: 'ID', dataIndex: 'id' },
  { title: 'Description', dataIndex: 'description' },
  { title: 'Propriétaire', dataIndex: 'owner' },
  { title: 'Contact', dataIndex: 'contact' },
  { title: 'Prix', dataIndex: 'price' },
  { title: 'Statut', dataIndex: 'status' },
  { title: 'Date promise', dataIndex: 'date_promised' },
  { title: 'Jours restants', dataIndex: 'days_left' },
]

async function load() { rows.value = await getWithDeadlines(owner.value || undefined) }
function rowClass(record: any) {
  if (record.days_left == null) return ''
  if (record.days_left < 0) return 'ant-table-row-error'
  if (record.days_left <= 1) return 'ant-table-row-warning'
  return ''
}
load()
</script>

<style>
.ant-table-row-error { background-color: #fff1f0; }
.ant-table-row-warning { background-color: #fffbe6; }
</style>
