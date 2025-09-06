<template>
  <a-card title="Statistiques" :bordered="false">
    <a-row :gutter="[16, 16]">
      <a-col :span="12" v-for="card in cards" :key="card.title">
        <a-card :title="card.title" :bordered="false" class="stat-card">
          <div class="stat-value">{{ card.value }}</div>
        </a-card>
      </a-col>
    </a-row>
  </a-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getStats } from '../store/items'

const cards = ref<{ title: string, value: number | string }[]>([])

onMounted(async () => {
  const s = await getStats()
  cards.value = [
    { title: 'Articles au total', value: s.total_items },
    { title: 'Articles en attente', value: s.pending_items },
    { title: 'Articles nettoyés', value: s.cleaned_items },
    { title: 'Articles livrés', value: s.delivered_items },
    { title: 'Revenu total', value: `${s.total_revenue} FCFA` },
  ]
})
</script>

<style scoped>
.stat-card {
  text-align: center;
  background-color: #f0f2f5;
}

.stat-value {
  font-size: 1.8em;
  font-weight: 700;
}
</style>
