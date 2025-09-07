<template>
  <LoadingWrapper :loading="itemsStore.loading" :error="itemsStore.error" :show-skeleton="true" :skeleton-rows="2"
    @retry="loadData">

    <!-- Statistics Cards -->
    <a-row :gutter="[16, 16]">
      <a-col :xs="12" :sm="12" :md="6" v-for="card in cards" :key="card.title">
        <a-card :title="card.title" :bordered="false" class="stat-card">
          <div class="stat-value">{{ card.value }}</div>
          <div class="stat-subtitle">{{ card.subtitle }}</div>
        </a-card>
      </a-col>
    </a-row>

    <!-- Quick Actions -->
    <a-row :gutter="[16, 16]" style="margin-top: 32px">
      <a-col :xs="24" :sm="12" :md="6" v-for="action in quickActions" :key="action.key">
        <QuickActionCard
          :title="action.title"
          :description="action.description"
          :icon="action.icon"
          :badge="action.badge"
          :danger="action.danger"
          @click="action.onClick"
        />
      </a-col>
    </a-row>

    <a-row :gutter="[16, 16]" style="margin-top: 48px">
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
import QuickActionCard from '../components/common/QuickActionCard.vue'
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

const quickActions = computed(() => [
  {
    key: 'register',
    title: 'Nouvel Article',
    description: 'Enregistrer un nouveau vêtement',
    icon: PlusCircleOutlined,
    onClick: () => router.push('/item-register'),
    danger: false,
    badge: null
  },
  {
    key: 'search',
    title: 'Rechercher',
    description: 'Trouver un article spécifique',
    icon: SearchOutlined,
    onClick: () => router.push('/item'),
    danger: false,
    badge: null
  },
  {
    key: 'pending',
    title: 'En Attente',
    description: 'Articles en cours de traitement',
    icon: ClockCircleOutlined,
    onClick: () => router.push('/pending'),
    danger: false,
    badge: itemsStore.stats.pending_items || null
  },
  {
    key: 'deadlines',
    title: 'Délais',
    description: 'Suivi des échéances',
    icon: CalendarOutlined,
    onClick: () => router.push('/deadlines'),
    danger: overdueCount.value > 0,
    badge: overdueCount.value || null
  }
])

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
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.stat-card:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
  border-color: #f0f0f0;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #1677ff;
  margin: 12px 0;
}

.stat-subtitle {
  color: #666;
  font-size: 14px;
  font-weight: 500;
}

.chart-container {
  position: relative;
  height: 220px;
  width: 100%;
}

@media (max-width: 768px) {
  .stat-value {
    font-size: 26px;
  }

  .chart-container {
    height: 180px;
  }
}

@media (max-width: 576px) {
  .stat-value {
    font-size: 22px;
  }
}
</style>
