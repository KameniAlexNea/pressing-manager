<template>
  <a-card title="Sauvegarde & Restauration">
    <a-space direction="vertical" style="width:100%">
      <a-alert type="info" show-icon message="Les données sont stockées localement sur cet appareil." />

      <a-space>
        <a-button type="primary" @click="exportData">Exporter (JSON)</a-button>
        <a-upload :before-upload="beforeUpload" :show-upload-list="false" accept="application/json,.json">
          <a-button>Importer (JSON)</a-button>
        </a-upload>
        <a-popconfirm title="Effacer toutes les données locales ?" ok-text="Oui" cancel-text="Non" @confirm="clearAll">
          <a-button danger>Tout effacer</a-button>
        </a-popconfirm>
      </a-space>

      <a-alert v-if="message" :message="message" :type="messageType" show-icon />
    </a-space>
  </a-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { exportItems, importItems, clearItems } from '../store/items'

const message = ref('')
const messageType = ref<'success'|'error'|'info'|'warning'>('info')

async function exportData() {
  const blob = new Blob([await exportItems()], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `pressing-data-${new Date().toISOString()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function beforeUpload(file: File) {
  const reader = new FileReader()
  reader.onload = async () => {
    try {
      await importItems(String(reader.result))
      message.value = 'Importation réussie.'
      messageType.value = 'success'
    } catch (e) {
      message.value = 'Échec importation: fichier invalide.'
      messageType.value = 'error'
    }
  }
  reader.readAsText(file)
  return false
}

async function clearAll() {
  await clearItems()
  message.value = 'Toutes les données locales ont été effacées.'
  messageType.value = 'warning'
}
</script>
