<template>
  <LoadingWrapper :loading="itemsStore.loading" :error="itemsStore.error" :show-skeleton="true" :skeleton-rows="2"
    @retry="loadData">

    <!-- Quick Actions -->
    <a-row :gutter="[16, 16]" style="margin-top: 24px">
      <a-col :span="24">
        <a-card title="Actions rapides" :bordered="false">
          <a-space wrap size="large">
            <a-button type="primary" size="large" @click="$router.push('/item-register')">
              <template #icon>
                <PlusCircleOutlined />
              </template>
              Nouvel Article
            </a-button>
            <a-button size="large" @click="$router.push('/item')">
              <template #icon>
                <SearchOutlined />
              </template>
              Rechercher
            </a-button>
            <a-button size="large" @click="$router.push('/pending')">
              <template #icon>
                <ClockCircleOutlined />
              </template>
              En Attente
            </a-button>
            <a-button size="large" @click="$router.push('/deadlines')" :danger="overdueCount > 0">
              <template #icon>
                <CalendarOutlined />
              </template>
              Délais
              <a-badge v-if="overdueCount > 0" :count="overdueCount" style="margin-left: 8px" />
            </a-button>
          </a-space>
        </a-card>
      </a-col>
    </a-row>
    
    <a-row :gutter="[16, 16]">
      <a-col :xs="12" :sm="12" :md="6" v-for="card in cards" :key="card.title">
        <a-card :title="card.title" :bordered="false" class="stat-card">
          <div class="stat-value">{{ card.value }}</div>
          <div class="stat-subtitle">{{ card.subtitle }}</div>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="[16, 16]" style="margin-top: 24px">
      <a-col :span="24">
        <a-card title="Articles par semaine" :bordered="false">
          <div class="chart-container">
            <canvas ref="chartRef" height="220"></canvas>
          </div>
        </a-card>
      </a-col>
    </a-row>

  </LoadingWrapper>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useItemsStore } from '../store/itemsStore'
import LoadingWrapper from '../components/common/LoadingWrapper.vue'
import Chart from 'chart.js/auto'
import dayjs from 'dayjs'
import {
  PlusCircleOutlined,
  SearchOutlined,
  ClockCircleOutlined,
  CalendarOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const itemsStore = useItemsStore()
const chartRef = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

const cards = computed(() => {
  const stats = itemsStore.stats
  return [
    { title: 'Total', value: stats.total_items, subtitle: 'Articles' },
    { title: 'Nettoyés', value: stats.cleaned_items, subtitle: 'Articles' },
    { title: 'Livrés', value: stats.delivered_items, subtitle: 'Articles' },
    { title: 'En attente', value: stats.pending_items, subtitle: 'Articles' },
  ]
})

const overdueCount = computed(() => {
  const today = dayjs()
  return itemsStore.items.filter(item =>
    item.date_promised &&
    item.status !== 'delivered' &&
    dayjs(item.date_promised).isBefore(today, 'day')
  ).length
})

async function loadData() {
  try {
    await itemsStore.fetchAllItems()
    createChart()
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  }
}

function createChart() {
  if (!chartRef.value || itemsStore.items.length === 0) return

  // Destroy existing chart if it exists
  if (chartInstance) {
    chartInstance.destroy()
  }

  // Compute weekly registration counts for the last 8 weeks
  const now = new Date()
  const weeks: string[] = []
  const data: number[] = []

  for (let i = 7; i >= 0; i--) {
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay() - i * 7)
    weekStart.setHours(0, 0, 0, 0)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    weekEnd.setHours(23, 59, 59, 999)

    const weekLabel = `${weekStart.getDate()}/${weekStart.getMonth() + 1}`
    weeks.push(weekLabel)

    const count = itemsStore.items.filter(item => {
      const itemDate = new Date(item.date_received)
      return itemDate >= weekStart && itemDate <= weekEnd
    }).length

    data.push(count)
  }

  chartInstance = new Chart(chartRef.value, {
    type: 'line',
    data: {
      labels: weeks,
      datasets: [{
        label: 'Articles enregistrés',
        data: data,
        borderColor: '#1677ff',
        backgroundColor: 'rgba(22, 119, 255, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: '#f0f0f0'
          },
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  })
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.stat-card {
  text-align: center;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #1677ff;
  margin: 8px 0;
}

.stat-subtitle {
  color: #666;
  font-size: 14px;
}

.chart-container {
  position: relative;
  height: 220px;
  width: 100%;
}

@media (max-width: 768px) {
  .stat-value {
    font-size: 24px;
  }

  .chart-container {
    height: 180px;
  }
}
</style>
