<template>
  <a-card title="Types de vêtements" style="max-width:500px;margin:auto">
    <a-form layout="inline" @submit.prevent="onAdd">
      <a-form-item>
        <a-input v-model:value="newType" placeholder="Nouveau type" />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit">Ajouter</a-button>
      </a-form-item>
    </a-form>
    <a-list :data-source="types" bordered style="margin-top:1em">
      <template #renderItem="{ item }">
        <a-list-item>
          <a-input v-model:value="item.name" style="width:150px; margin-right:8px" @blur="onEdit(item)" />
          <a-button danger size="small" @click="remove(item.id)">Supprimer</a-button>
        </a-list-item>
      </template>
    </a-list>
    <a-button style="margin-top:1em" @click="reset">Réinitialiser les types par défaut</a-button>
  </a-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { getTypes, addType, removeType, editType, resetTypes } from '../store/types'

const types = getTypes()
const newType = ref('')

function onAdd() {
  if (newType.value.trim()) {
    addType(newType.value.trim())
    newType.value = ''
  }
}
function remove(id: string) {
  removeType(id)
}
function onEdit(item: { id: string, name: string }) {
  editType(item.id, item.name)
}
function reset() {
  resetTypes()
}
</script>
