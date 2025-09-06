<template>
  <a-card title="Sauvegarde et Restauration" :bordered="false">
    <a-space direction="vertical" style="width:100%">
      <a-alert 
        type="info" 
        show-icon 
        message="Gestion des données"
        description="Les données sont stockées localement sur cet appareil. Vous pouvez les exporter pour les sauvegarder ou les transférer."
      />

      <a-row :gutter="[16, 16]" style="margin-top: 24px;">
        <a-col :span="24">
          <a-button type="primary" block size="large" @click="exportData">
            <template #icon><DownloadOutlined /></template>
            Exporter les données
          </a-button>
        </a-col>
        <a-col :span="24">
          <a-upload 
            :before-upload="beforeUpload" 
            :show-upload-list="false" 
            accept="application/json,.json"
            customRequest="() => {}"
          >
            <a-button block size="large">
              <template #icon><UploadOutlined /></template>
              Importer les données
            </a-button>
          </a-upload>
        </a-col>
        <a-col :span="24">
          <a-popconfirm 
            title="Êtes-vous sûr de vouloir effacer toutes les données ?"
            ok-text="Oui, tout effacer" 
            cancel-text="Annuler" 
            @confirm="clearAll"
            placement="topRight"
          >
            <a-button danger block size="large">
              <template #icon><DeleteOutlined /></template>
              Effacer toutes les données
            </a-button>
          </a-popconfirm>
        </a-col>
      </a-row>
    </a-space>
  </a-card>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue';
import { exportItems, importItems, clearItems } from '../store/items'
import { DownloadOutlined, UploadOutlined, DeleteOutlined } from '@ant-design/icons-vue'

async function exportData() {
  try {
    const blob = new Blob([await exportItems()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pressing-manager-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    message.success('Exportation réussie.');
  } catch (error) {
    message.error('Erreur lors de l\'exportation.');
  }
}

function beforeUpload(file: File) {
  const reader = new FileReader()
  reader.onload = async () => {
    try {
      await importItems(String(reader.result))
      message.success('Importation réussie. La page va être rechargée.');
      setTimeout(() => window.location.reload(), 2000);
    } catch (e) {
      message.error('Échec de l\'importation: le fichier est peut-être invalide.');
    }
  }
  reader.readAsText(file)
  return false
}

async function clearAll() {
  try {
    await clearItems()
    message.warning('Toutes les données ont été effacées. La page va être rechargée.');
    setTimeout(() => window.location.reload(), 2000);
  } catch (error) {
    message.error('Erreur lors de la suppression des données.');
  }
}
</script>
