<template>
  <LoadingWrapper
    :loading="itemsStore.loading"
    :error="itemsStore.error"
    loading-text="Enregistrement en cours..."
    @retry="() => itemsStore.setError(null)"
  >
    <a-card title="Enregistrer un article" :bordered="false">
      <ItemRegistrationForm
        @success="handleRegistrationSuccess"
        @error="handleRegistrationError"
      />
    </a-card>
  </LoadingWrapper>
</template>

<script setup lang="ts">
import { useItemsStore } from '../store/itemsStore'
import LoadingWrapper from '../components/common/LoadingWrapper.vue'
import ItemRegistrationForm from '../components/items/ItemRegistrationForm.vue'
import { message } from 'ant-design-vue'

const itemsStore = useItemsStore()

function handleRegistrationSuccess(itemId: string) {
  message.success(`Article enregistré avec succès! Code: ${itemId}`)
}

function handleRegistrationError(error: string) {
  console.error('Registration error:', error)
  message.error(`Erreur lors de l'enregistrement: ${error}`)
}
</script>

<style scoped>
.item-row {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 8px;
}
</style>
