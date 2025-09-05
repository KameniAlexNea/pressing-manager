<template>
  <a-row :gutter="16">
    <a-col :span="6" v-for="card in cards" :key="card.title">
      <a-card :title="card.title" style="margin-bottom:12px">
        <div style="font-size:24px;font-weight:700">{{ card.value }}</div>
      </a-card>
    </a-col>
  </a-row>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getStats } from '../store/items'

const cards = ref<{ title: string, value: number }[]>([])

onMounted(async () => {
  const s = await getStats()
  cards.value = [
    { title: 'Total', value: s.total_items },
    { title: 'Nettoyés', value: s.cleaned_items },
    { title: 'Livrés', value: s.delivered_items },
    { title: 'En attente', value: s.pending_items },
  ]
})
</script>
