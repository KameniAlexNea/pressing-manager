<template>
    <!-- List Item Mode -->
    <a-list-item v-if="listMode" :class="['item-card', { 'overdue': isOverdue }]">
        <template #actions>
            <slot name="actions" :item="item">
                <!-- Default actions -->
                <a-button v-if="showStatusActions && item.status === 'received'" type="primary" size="small"
                    @click="$emit('statusChange', item.id, 'cleaned')" :loading="loading" :disabled="loading">
                    Nettoyé
                </a-button>
                <a-button v-if="showStatusActions && item.status === 'cleaned'" type="primary" size="small"
                    @click="$emit('statusChange', item.id, 'delivered')" :loading="loading" :disabled="loading">
                    Livré
                </a-button>
                <a-button size="small" @click="$emit('view', item.id)">
                    Détails
                </a-button>
            </slot>
        </template>

        <a-list-item-meta>
            <template #avatar v-if="item.image">
                <a-avatar :src="item.image" size="large" shape="square" @click="$emit('imagePreview', item.image)"
                    class="item-image-avatar" />
            </template>

            <template #title>
                <div class="item-title">
                    <a @click="$emit('view', item.id)" class="item-link">
                        {{ item.owner }} - Article #{{ item.id }}
                    </a>
                    <a-tag :color="statusColor(item.status)" class="status-tag">
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
                        <a-tag v-for="(itemLine, index) in item.items" :key="index" class="item-tag">
                            {{ itemLine.qty }}x {{ itemLine.type }}
                            <span v-if="itemLine.notes" class="item-notes">
                                ({{ itemLine.notes }})
                            </span>
                        </a-tag>
                    </div>

                    <!-- Deadline warning -->
                    <div v-if="deadlineInfo" class="deadline-info">
                        <a-tag :color="deadlineInfo.color" class="deadline-tag">
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

    <!-- Card Mode -->
    <a-card v-else :title="'Article #' + item.id" class="item-detail-card">
        <template #extra>
            <a-tag :color="statusColor(item.status)">{{ getStatusText(item.status) }}</a-tag>
        </template>

        <a-skeleton :loading="loading" active>
            <img v-if="item.image" :src="item.image" alt="Photo vêtement" class="item-image" />

            <a-descriptions :column="1" size="small" bordered>
                <a-descriptions-item label="Propriétaire"><strong>{{ item.owner }}</strong></a-descriptions-item>
                <a-descriptions-item label="Contact">{{ item.contact || 'N/A' }}</a-descriptions-item>
                <a-descriptions-item label="Prix">{{ item.price }} FCFA</a-descriptions-item>
                <a-descriptions-item v-if="item.amountGiven" label="Montant Payé">{{ item.amountGiven }} FCFA</a-descriptions-item>
                <a-descriptions-item v-if="item.amountGiven && item.amountGiven > item.price" label="Monnaie">{{ item.amountGiven - item.price }} FCFA</a-descriptions-item>
                <a-descriptions-item label="Reçu le">{{ formatDate(item.date_received) }}</a-descriptions-item>
                <a-descriptions-item v-if="item.date_promised" label="Promis pour le">{{ formatDate(item.date_promised) }}</a-descriptions-item>
                <a-descriptions-item v-if="item.date_cleaned" label="Nettoyé le">{{ formatDate(item.date_cleaned) }}</a-descriptions-item>
                <a-descriptions-item v-if="item.date_delivered" label="Livré le">{{ formatDate(item.date_delivered) }}</a-descriptions-item>
            </a-descriptions>

            <div v-if="item.items?.length" class="items-section">
                <div class="items-header">
                    <strong>Articles :</strong>
                    <a-button v-if="showActions && !isEditing && item.status !== 'delivered'" size="small"
                        @click="startEditing" :disabled="loading">
                        Modifier
                    </a-button>
                </div>

                <!-- View mode -->
                <a-list v-if="!isEditing" size="small">
                    <a-list-item v-for="(line, i) in item.items" :key="i">
                        {{ line.qty }} × {{ line.type }}
                        <span v-if="line.notes" class="item-notes">({{ line.notes }})</span>
                    </a-list-item>
                </a-list>

                <!-- Edit mode -->
                <div v-else class="edit-mode">
                    <div v-for="(editItem, idx) in editingItems" :key="idx" class="edit-item-row">
                        <a-select v-model:value="editItem.type" placeholder="Type" style="flex: 2;">
                            <a-select-option v-for="t in types" :key="t.id" :value="t.name">{{ t.name
                                }}</a-select-option>
                        </a-select>
                        <a-input-number v-model:value="editItem.qty" :min="1" placeholder="Qté" style="flex: 1;" />
                        <a-input v-model:value="editItem.notes" placeholder="Note" style="flex: 2;" />
                        <a-button danger @click="removeEditItem(idx)" :disabled="editingItems.length === 1"
                            size="small">
                            <template #icon>
                                <DeleteOutlined />
                            </template>
                        </a-button>
                    </div>

                    <a-button type="dashed" block @click="addEditItem" style="margin: 8px 0;">
                        <template #icon>
                            <PlusOutlined />
                        </template>
                        Ajouter un article
                    </a-button>

                    <a-space>
                        <a-button type="primary" @click="saveItemsChanges" :loading="loading">
                            Sauvegarder
                        </a-button>
                        <a-button @click="cancelEditing" :disabled="loading">
                            Annuler
                        </a-button>
                    </a-space>
                </div>
            </div>

            <a-space v-if="showActions" class="status-actions" :wrap="true">
                <a-button v-if="item.status === 'received'" type="primary"
                    @click="$emit('statusChange', item.id, 'cleaned')" :loading="loading" :disabled="loading">
                    Marquer comme Nettoyé
                </a-button>
                <a-button v-if="item.status === 'cleaned'" type="primary"
                    @click="$emit('statusChange', item.id, 'delivered')" :loading="loading" :disabled="loading">
                    Marquer comme Livré
                </a-button>
            </a-space>
        </a-skeleton>
    </a-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { type ClothingItem, type ItemLine } from '../../store/items'
import { getTypes } from '../../store/types'
import { useFormatting } from '../../composables/useFormatting'
import { message } from 'ant-design-vue'
import { PlusOutlined, DeleteOutlined, ExclamationCircleOutlined, CalendarOutlined, CheckCircleOutlined, CarOutlined, DollarOutlined, PhoneOutlined, ClockCircleOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'

interface Props {
    item: ClothingItem
    loading?: boolean
    showActions?: boolean
    listMode?: boolean
    showStatusActions?: boolean
    showDeadline?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    loading: false,
    showActions: true,
    listMode: false,
    showStatusActions: true,
    showDeadline: false
})

const emit = defineEmits<{
    statusChange: [id: string, status: 'cleaned' | 'delivered']
    saveItems: [id: string, items: ItemLine[]]
    view: [id: string]
    imagePreview: [imageUrl: string]
}>()

const { formatDate, statusColor } = useFormatting()

// Editing state
const isEditing = ref(false)
const editingItems = ref<ItemLine[]>([])
const types = getTypes()

const isOverdue = computed(() => {
    if (!props.item.date_promised || props.item.status === 'delivered') return false
    return dayjs(props.item.date_promised).isBefore(dayjs(), 'day')
})

const deadlineInfo = computed(() => {
    if (!props.showDeadline || !props.item.date_promised || props.item.status === 'delivered') {
        return null
    }

    const daysLeft = dayjs(props.item.date_promised).diff(dayjs(), 'day')

    if (daysLeft < 0) {
        return { text: `En retard de ${Math.abs(daysLeft)} jour(s)`, color: 'error', isOverdue: true }
    } else if (daysLeft <= 1) {
        return { text: daysLeft === 0 ? 'À livrer aujourd\'hui' : 'À livrer demain', color: 'warning', isOverdue: false }
    } else if (daysLeft <= 3) {
        return { text: `${daysLeft} jours restants`, color: 'orange', isOverdue: false }
    }
    return { text: `${daysLeft} jours restants`, color: 'blue', isOverdue: false }
})

function getStatusText(status: string): string {
    return { 'received': 'Reçu', 'cleaned': 'Nettoyé', 'delivered': 'Livré' }[status] || status
}

function startEditing() {
    if (!props.item?.items) return
    editingItems.value = props.item.items.map(i => ({ type: i.type, qty: i.qty, notes: i.notes || '' }))
    isEditing.value = true
}

function cancelEditing() {
    isEditing.value = false
    editingItems.value = []
}

function addEditItem() {
    editingItems.value.push({ type: types.value[0]?.name || '', qty: 1, notes: '' })
}

function removeEditItem(index: number) {
    if (editingItems.value.length > 1) editingItems.value.splice(index, 1)
}

async function saveItemsChanges() {
    if (!props.item) return

    const validItems = editingItems.value.filter(i => i.type?.trim())
    if (!validItems.length) {
        message.warning('Au moins un article doit être spécifié.')
        return
    }

    emit('saveItems', props.item.id, editingItems.value)
    isEditing.value = false
    editingItems.value = []
}
</script>

<style scoped>
.item-detail-card {
  max-width: 800px;
  margin: 0 auto;
}

.item-image {
  max-width: 100%;
  max-height: 250px;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

.items-section {
  margin-top: 16px;
}

.items-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.item-notes {
  color: #888;
  margin-left: 8px;
}

.edit-mode {
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  padding: 12px;
  margin-top: 8px;
}

.edit-item-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}

.status-actions {
  margin-top: 16px;
  width: 100%;
  justify-content: center;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .item-card {
    padding: 12px 8px;
    margin-bottom: 8px;
  }

  .item-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .item-link {
    font-size: 14px;
    font-weight: 600;
  }

  .status-tag {
    font-size: 11px;
    align-self: flex-start;
  }

  .item-description {
    font-size: 13px;
  }

  .item-details {
    flex-direction: column;
    gap: 4px;
    margin-bottom: 8px;
  }

  .detail-item {
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .item-meta {
    flex-direction: column;
    gap: 6px;
    align-items: flex-start;
  }

  .price-info,
  .contact-info {
    font-size: 12px;
  }

  .items-list {
    margin: 6px 0;
  }

  .item-tag {
    font-size: 11px;
    margin-bottom: 2px;
  }

  .deadline-info {
    margin-top: 6px;
  }

  .deadline-tag {
    font-size: 11px;
  }
}
</style>