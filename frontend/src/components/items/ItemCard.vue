<template>
  <a-list-item :class="['item-card', { 'overdue': isOverdue }]">
    <template #actions>
      <slot name="actions" :item="item">
        <!-- Default actions -->
        <a-button 
          v-if="showStatusActions && item.status === 'received'" 
          type="primary" 
          size="small"
          @click="$emit('statusChange', item.id, 'cleaned')"
          :loading="loading"
          :disabled="loading"
        >
          Nettoyé
        </a-button>
        <a-button 
          v-if="showStatusActions && item.status === 'cleaned'" 
          type="primary" 
          size="small"
          @click="$emit('statusChange', item.id, 'delivered')"
          :loading="loading"
          :disabled="loading"
        >
          Livré
        </a-button>
        <a-button 
          size="small" 
          @click="$emit('view', item.id)"
        >
          Détails
        </a-button>
      </slot>
    </template>

    <a-list-item-meta>
      <template #avatar v-if="item.image">
        <a-avatar 
          :src="item.image" 
          size="large" 
          shape="square"
          @click="$emit('imagePreview', item.image)"
          class="item-image-avatar"
        />
      </template>

      <template #title>
        <div class="item-title">
          <a @click="$emit('view', item.id)" class="item-link">
            {{ item.owner }} - Article #{{ item.id }}
          </a>
          <a-tag 
            :color="getStatusColor(item.status)" 
            class="status-tag"
          >
            {{ getStatusText(item.status) }}
          </a-tag>
        </div>
      </template>

      <template #description>
        <div class="item-description">
          <p v-if="item.description" class="description-text">
            {{ item.description }}
          </p>
          
          <div class="item-details">
            <span class="detail-item">
              <ClockCircleOutlined />
              Reçu le: {{ formatDate(item.date_received) }}
            </span>
            
            <span v-if="item.date_promised" class="detail-item">
              <CalendarOutlined />
              Promis pour le: {{ formatDate(item.date_promised) }}
            </span>
            
            <span v-if="item.date_cleaned" class="detail-item">
              <CheckCircleOutlined />
              Nettoyé le: {{ formatDate(item.date_cleaned) }}
            </span>
            
            <span v-if="item.date_delivered" class="detail-item">
              <CarOutlined />
              Livré le: {{ formatDate(item.date_delivered) }}
            </span>
          </div>

          <div class="item-meta">
            <span class="price-info">
              <DollarOutlined />
              {{ item.price }} FCFA
              <span v-if="item.amountGiven && item.amountGiven !== item.price" class="payment-info">
                (Payé: {{ item.amountGiven }} FCFA)
              </span>
            </span>
            
            <span v-if="item.contact" class="contact-info">
              <PhoneOutlined />
              {{ item.contact }}
            </span>
          </div>

          <!-- Items list if available -->
          <div v-if="item.items && item.items.length > 0" class="items-list">
            <a-tag 
              v-for="(itemLine, index) in item.items" 
              :key="index"
              class="item-tag"
            >
              {{ itemLine.qty }}x {{ itemLine.type }}
              <span v-if="itemLine.notes" class="item-notes">
                ({{ itemLine.notes }})
              </span>
            </a-tag>
          </div>

          <!-- Deadline warning -->
          <div v-if="deadlineInfo" class="deadline-info">
            <a-tag 
              :color="deadlineInfo.color"
              class="deadline-tag"
            >
              <ExclamationCircleOutlined v-if="deadlineInfo.isOverdue" />
              {{ deadlineInfo.text }}
            </a-tag>
          </div>
        </div>
      </template>
    </a-list-item-meta>

    <template #extra v-if="$slots.extra">
      <slot name="extra" :item="item"></slot>
    </template>
  </a-list-item>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { 
  ClockCircleOutlined, 
  CalendarOutlined, 
  CheckCircleOutlined,
  CarOutlined,
  DollarOutlined,
  PhoneOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons-vue'
import { useFormatting } from '../../composables/useFormatting'
import type { ClothingItem } from '../../store/items'
import dayjs from 'dayjs'

interface Props {
  item: ClothingItem
  showStatusActions?: boolean
  showDeadline?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showStatusActions: true,
  showDeadline: false,
  loading: false
})

const emit = defineEmits<{
  view: [id: string]
  statusChange: [id: string, status: 'cleaned' | 'delivered']
  imagePreview: [imageUrl: string]
}>()

const { formatDate, statusColor } = useFormatting()

const isOverdue = computed(() => {
  if (!props.item.date_promised || props.item.status === 'delivered') return false
  return dayjs(props.item.date_promised).isBefore(dayjs(), 'day')
})

const deadlineInfo = computed(() => {
  if (!props.showDeadline || !props.item.date_promised || props.item.status === 'delivered') {
    return null
  }

  const promisedDate = dayjs(props.item.date_promised)
  const today = dayjs()
  const daysLeft = promisedDate.diff(today, 'day')

  if (daysLeft < 0) {
    return {
      text: `En retard de ${Math.abs(daysLeft)} jour(s)`,
      color: 'error',
      isOverdue: true
    }
  } else if (daysLeft === 0) {
    return {
      text: 'À livrer aujourd\'hui',
      color: 'warning',
      isOverdue: false
    }
  } else if (daysLeft === 1) {
    return {
      text: 'À livrer demain',
      color: 'warning',
      isOverdue: false
    }
  } else if (daysLeft <= 3) {
    return {
      text: `${daysLeft} jours restants`,
      color: 'orange',
      isOverdue: false
    }
  } else {
    return {
      text: `${daysLeft} jours restants`,
      color: 'blue',
      isOverdue: false
    }
  }
})

function getStatusColor(status: string): string {
  return statusColor(status)
}

function getStatusText(status: string): string {
  const statusMap = {
    'received': 'Reçu',
    'cleaned': 'Nettoyé',
    'delivered': 'Livré'
  }
  return statusMap[status as keyof typeof statusMap] || status
}
</script>

<style scoped>
.item-card {
  border-radius: 8px;
  border: 1px solid #f0f0f0;
  margin-bottom: 8px;
  transition: all 0.3s ease;
  background: #fff;
}

.item-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-color: #d9d9d9;
}

.item-card.overdue {
  border-left: 4px solid #ff4d4f;
}

.item-image-avatar {
  cursor: pointer;
}

.item-image-avatar:hover {
  opacity: 0.8;
}

.item-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.item-link {
  font-weight: 600;
  color: #1677ff;
  text-decoration: none;
}

.item-link:hover {
  text-decoration: underline;
}

.status-tag {
  font-size: 12px;
  font-weight: 500;
}

.item-description {
  color: #666;
  line-height: 1.5;
}

.description-text {
  margin: 0 0 8px 0;
  font-style: italic;
}

.item-details {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 8px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
}

.item-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 8px;
  font-size: 13px;
}

.price-info {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
  color: #52c41a;
}

.payment-info {
  color: #666;
  font-weight: normal;
}

.contact-info {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #1677ff;
}

.items-list {
  margin: 8px 0;
}

.item-tag {
  margin-bottom: 4px;
}

.item-notes {
  font-style: italic;
  opacity: 0.8;
}

.deadline-info {
  margin-top: 8px;
}

.deadline-tag {
  font-weight: 500;
}

@media (max-width: 768px) {
  .item-title {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .item-details,
  .item-meta {
    flex-direction: column;
    gap: 4px;
  }
}
</style>
