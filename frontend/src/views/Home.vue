
<template>
  <a-row :gutter="16" style="margin-bottom:24px">
    <a-col :xs="24" :sm="12" :md="6" v-for="card in cards" :key="card.title">
      <a-card :title="card.title" :bordered="false" style="text-align:center">
        <div style="font-size:2em;font-weight:700">{{ card.value }}</div>
        <div style="color:#888">{{ card.subtitle }}</div>
      </a-card>
    </a-col>
  </a-row>
  <a-row :gutter="16">
    <a-col :xs="24">
      <a-card title="Articles par semaine" :bordered="false">
        <canvas ref="chart" height="220"></canvas>
      </a-card>
    </a-col>
  </a-row>
</template>

<script setup lang="ts">

import { onMounted, ref } from 'vue'
import { getStats, getAll } from '../store/items'
import Chart from 'chart.js/auto'

const cards = ref([
  { title: 'Total', value: 0, subtitle: 'Articles enregistrés' },
  { title: 'Nettoyés', value: 0, subtitle: 'Articles nettoyés' },
  { title: 'Livrés', value: 0, subtitle: 'Articles livrés' },
  { title: 'En attente', value: 0, subtitle: 'Articles en attente' },
])

const chart = ref<HTMLCanvasElement | null>(null)

onMounted(async () => {
  const s = await getStats()
  cards.value[0].value = s.total_items
  cards.value[1].value = s.cleaned_items
  cards.value[2].value = s.delivered_items
  cards.value[3].value = s.pending_items

  // Compute real weekly registration counts for the last 8 weeks
  const items = await getAll()
  const now = new Date()
  const weeks: string[] = []
  const data: number[] = []
  for (let i = 7; i >= 0; i--) {
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay() - i * 7)
    weekStart.setHours(0, 0, 0, 0)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 7)
    const count = items.filter(item => {
      const d = new Date(item.date_received)
      return d >= weekStart && d < weekEnd
    }).length
    const weekLabel = `${weekStart.getDate().toString().padStart(2, '0')}/${(weekStart.getMonth()+1).toString().padStart(2, '0')}`
    weeks.push(weekLabel)
    data.push(count)
  }
  if (chart.value) {
    new Chart(chart.value, {
      type: 'bar',
      data: {
        labels: weeks,
        datasets: [{
          label: 'Articles enregistrés',
          data,
          backgroundColor: '#1677ff',
          borderRadius: 6,
          maxBarThickness: 24,
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        responsive: true,
        scales: { y: { beginAtZero: true } }
      }
    })
  }
})
</script>
