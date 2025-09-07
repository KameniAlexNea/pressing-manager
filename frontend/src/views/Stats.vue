<template>
  <a-card title="Statistiques" :bordered="false">
    <a-row :gutter="[16, 16]">
      <a-col :span="12" v-for="card in cards" :key="card.title">
        <a-card :bordered="false" class="stat-card">
          <div class="stat-content">
            <component :is="card.icon" class="stat-icon" />
            <div class="stat-info">
              <div class="stat-title">{{ card.title }}</div>
              <div class="stat-value">{{ card.value }}</div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>
  </a-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getStats } from '../store/items'
import { 
  ShoppingOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  DeliveredProcedureOutlined, 
  DollarCircleOutlined 
} from '@ant-design/icons-vue'

const cards = ref<{ title: string, value: number | string, icon: any }[]>([])

onMounted(async () => {
  const s = await getStats()
  cards.value = [
    { title: 'Total', value: s.total_items, icon: ShoppingOutlined },
    { title: 'En attente', value: s.pending_items, icon: ClockCircleOutlined },
    { title: 'Nettoyés', value: s.cleaned_items, icon: CheckCircleOutlined },
    { title: 'Livrés', value: s.delivered_items, icon: DeliveredProcedureOutlined },
    { title: 'Revenu', value: `${s.total_revenue || 0} F`, icon: DollarCircleOutlined },
  ]
})
</script>

<style scoped>
.stat-card {
  background-color: #f0f2f5;
  border-radius: 8px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-icon {
  font-size: 24px;
  color: #1890ff;
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
  min-width: 0;
}

.stat-title {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 576px) {
  .stat-icon {
    font-size: 20px;
  }
  
  .stat-title {
    font-size: 11px;
  }
  
  .stat-value {
    font-size: 16px;
  }
}
</style>
