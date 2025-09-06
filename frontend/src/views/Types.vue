<template>
  <a-card title="Gérer les types d'articles" :bordered="false">
    <a-form @submit.prevent="onAdd" layout="inline" style="margin-bottom: 24px;">
      <a-form-item style="flex-grow: 1;">
        <a-input v-model:value="newType" placeholder="Ajouter un nouveau type" />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" :disabled="!newType.trim()">
          <template #icon><PlusOutlined /></template>
          Ajouter
        </a-button>
      </a-form-item>
    </a-form>

    <a-list :data-source="types" item-layout="horizontal">
      <template #renderItem="{ item }">
        <a-list-item>
          <a-list-item-meta>
            <template #title>
              <a-input 
                v-if="editingId === item.id" 
                v-model:value="editingName" 
                @pressEnter="() => onEdit(item)"
                @blur="() => onEdit(item)"
                ref="editingInput"
              />
              <span v-else>{{ item.name }}</span>
            </template>
          </a-list-item-meta>
          <template #actions>
            <a-button type="text" @click="() => startEditing(item)">
              <template #icon><EditOutlined /></template>
            </a-button>
            <a-popconfirm
              title="Êtes-vous sûr de vouloir supprimer ce type ?"
              ok-text="Oui"
              cancel-text="Non"
              @confirm="() => remove(item.id)"
            >
              <a-button type="text" danger>
                <template #icon><DeleteOutlined /></template>
              </a-button>
            </a-popconfirm>
          </template>
        </a-list-item>
      </template>
    </a-list>

    <a-popconfirm
      title="Réinitialiser la liste aux types par défaut ?"
      description="Cette action est irréversible."
      ok-text="Oui, réinitialiser"
      cancel-text="Annuler"
      @confirm="reset"
    >
      <a-button danger style="margin-top: 24px;">
        <template #icon><ReloadOutlined /></template>
        Réinitialiser les types
      </a-button>
    </a-popconfirm>
  </a-card>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { getTypes, addType, removeType, editType, resetTypes } from '../store/types'
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

const types = getTypes()
const newType = ref('')

const editingId = ref<string | null>(null)
const editingName = ref('')
const editingInput = ref<HTMLInputElement | null>(null)

function onAdd() {
  if (newType.value.trim()) {
    addType(newType.value.trim())
    message.success(`"${newType.value.trim()}" a été ajouté.`)
    newType.value = ''
  }
}

function remove(id: string) {
  removeType(id)
  message.info('Type supprimé.')
}

function startEditing(item: { id: string, name: string }) {
  editingId.value = item.id
  editingName.value = item.name
  nextTick(() => {
    editingInput.value?.focus()
  })
}

function onEdit(item: { id: string, name: string }) {
  if (editingName.value.trim() && editingName.value.trim() !== item.name) {
    editType(item.id, editingName.value.trim())
    message.success('Type mis à jour.')
  }
  editingId.value = null
}

function reset() {
  resetTypes()
  message.info('La liste des types a été réinitialisée.')
}
</script>
