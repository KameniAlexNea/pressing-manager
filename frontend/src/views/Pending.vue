<template>
  <a-card title="Articles">
    <a-tabs v-model:activeKey="statusTab" style="margin-bottom: 1em;">
      <a-tab-pane key="received" tab="Reçus" />
      <a-tab-pane key="cleaned" tab="Nettoyés" />
      <a-tab-pane key="delivered" tab="Livrés" />
    </a-tabs>
    <a-space style="margin-bottom: 1em;">
      <a-input-number v-model:value="days" :min="0" />
      <a-button type="primary" @click="load">Rechercher</a-button>
      <a-button :disabled="!selectedRowKeys.length || statusTab==='delivered'" @click="batchMarkCleaned" v-if="statusTab==='received'">Marquer nettoyé</a-button>
      <a-button :disabled="!selectedRowKeys.length || statusTab!=='cleaned'" @click="batchMarkDelivered" v-if="statusTab==='cleaned'">Marquer livré</a-button>
    </a-space>
    <a-table
      :columns="columns"
      :data-source="rows"
      :row-key="'id'"
      row-selection="{ selectedRowKeys, onChange: onSelectChange }"
      style="margin-top:12px"
    />
  </a-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { getAll, updateStatus } from '../store/items'

const days = ref<number>(7)
const statusTab = ref<'received'|'cleaned'|'delivered'>('received')
const rows = ref<any[]>([])
const selectedRowKeys = ref<string[]>([])
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

function onSelectChange(keys: string[]) {
  selectedRowKeys.value = keys
}

async function load() {
  const all = await getAll()
  rows.value = all.filter(i => i.status === statusTab.value && (!days.value || days.value === 0 || (i.date_received && i.date_received <= new Date(Date.now() - days.value*24*60*60*1000).toISOString())))
  selectedRowKeys.value = []
}

async function batchMarkCleaned() {
  for (const id of selectedRowKeys.value) {
    await updateStatus(id, 'cleaned')
  }
  await load()
}

async function batchMarkDelivered() {
  for (const id of selectedRowKeys.value) {
    await updateStatus(id, 'delivered')
  }
  await load()
}

load()

// Watch for tab change
import { watch } from 'vue'
watch(statusTab, load)
</script>
