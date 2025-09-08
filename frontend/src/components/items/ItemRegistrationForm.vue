<template>
  <a-form layout="vertical" @submit.prevent="onSubmit" :model="form">
    <!-- Articles Section -->
    <a-form-item label="Articles" required>
      <div class="items-section">
        <TransitionGroup name="item-list" tag="div">
          <div v-for="(item, idx) in form.items" :key="`item-${idx}`" class="item-row">
            <a-select 
              v-model:value="item.type" 
              placeholder="Type d'article" 
              class="item-type-select"
              :aria-label="`Type d'article ligne ${idx + 1}`"
              size="large"
            >
              <a-select-option v-for="t in types" :key="t.id" :value="t.name">
                {{ t.name }}
              </a-select-option>
            </a-select>
            
            <a-input-number 
              v-model:value="item.qty" 
              :min="1" 
              placeholder="Qté" 
              class="item-qty-input"
              :aria-label="`Quantité ligne ${idx + 1}`"
              size="large"
            />
            
            <a-input 
              v-model:value="item.notes" 
              placeholder="Note (couleur, taille, etc.)" 
              class="item-notes-input"
              :aria-label="`Note ligne ${idx + 1}`"
              size="large"
            />
            
            <a-button 
              danger 
              @click="removeItem(idx)" 
              :disabled="form.items.length === 1"
              :aria-label="`Supprimer ligne ${idx + 1}`"
              size="large"
              class="remove-item-btn"
            >
              <template #icon>
                <DeleteOutlined />
              </template>
            </a-button>
          </div>
        </TransitionGroup>
        
        <a-button 
          type="dashed" 
          block 
          @click="addItem" 
          size="large"
          class="add-item-btn"
        >
          <template #icon>
            <PlusOutlined />
          </template>
          Ajouter un article
        </a-button>
      </div>
    </a-form-item>

    <!-- Customer Information -->
    <a-row :gutter="16">
      <a-col :xs="24" :md="12">
        <a-form-item 
          label="Propriétaire" 
          name="owner"
          :rules="[{ required: true, message: 'Nom du propriétaire requis' }]"
        >
          <a-input 
            v-model:value="form.owner" 
            placeholder="Nom du propriétaire"
            size="large"
            aria-label="Nom du propriétaire"
          />
        </a-form-item>
      </a-col>
      
      <a-col :xs="24" :md="12">
        <a-form-item 
          label="Contact" 
          name="contact"
          :rules="[
            { required: true, message: 'Numéro de contact requis' },
            { pattern: /^(\+237)?6?\d{8}$/, message: 'Format: 6xxxxxxxx' }
          ]"
        >
          <a-input 
            v-model:value="form.contact" 
            placeholder="+237 6XX XXX XXX"
            size="large"
            aria-label="Numéro de contact"
          >
            <template #prefix>
              <PhoneOutlined />
            </template>
          </a-input>
        </a-form-item>
      </a-col>
    </a-row>

    <!-- Pricing Information -->
    <a-row :gutter="16">
      <a-col :xs="24" :md="12">
        <a-form-item 
          label="Prix" 
          name="price"
          :rules="[
            { required: true, message: 'Prix requis' },
            { type: 'number', min: 1, message: 'Prix > 0' }
          ]"
        >
          <a-input-number 
            v-model:value="form.price" 
            :min="1" 
            style="width:100%" 
            size="large"
            addon-after="FCFA"
            :formatter="formatCurrency"
            :parser="parseCurrency"
            aria-label="Prix"
          />
        </a-form-item>
      </a-col>
      
      <a-col :xs="24" :md="12">
        <a-form-item label="Montant reçu">
          <a-input-number 
            v-model:value="form.amountGiven" 
            :min="0" 
            style="width:100%" 
            size="large"
            addon-after="FCFA"
            :formatter="formatCurrency"
            :parser="parseCurrency"
            @change="calcChange"
            aria-label="Montant reçu"
          />
          <div v-if="change > 0" class="change-display">
            <CheckCircleOutlined /> Monnaie à rendre: <strong>{{ formatNumber(change) }} FCFA</strong>
          </div>
        </a-form-item>
      </a-col>
    </a-row>

    <!-- Dates -->
    <a-row :gutter="16">
      <a-col :xs="24" :md="12">
        <a-form-item label="Date de réception">
          <a-date-picker 
            v-model:value="form.date_received" 
            show-time 
            style="width:100%" 
            size="large"
            format="DD/MM/YYYY HH:mm"
            placeholder="Sélectionner la date"
          />
        </a-form-item>
      </a-col>
      
      <a-col :xs="24" :md="12">
        <a-form-item label="Date promise">
          <a-date-picker 
            v-model:value="form.date_promised" 
            show-time 
            style="width:100%" 
            size="large"
            format="DD/MM/YYYY HH:mm"
            placeholder="Date de livraison prévue"
          />
        </a-form-item>
      </a-col>
    </a-row>

    <!-- Notes -->
    <a-form-item label="Notes supplémentaires">
      <a-textarea 
        v-model:value="form.notes" 
        :rows="3" 
        placeholder="Instructions spéciales, défauts constatés..."
        aria-label="Notes générales"
        :maxlength="500"
        show-count
      />
    </a-form-item>

    <!-- Image Upload -->
    <a-form-item label="Photo (optionnelle)">
      <div class="upload-section">
        <a-upload 
          v-model:file-list="fileList" 
          list-type="picture-card" 
          :before-upload="() => false"
          @preview="handlePreview" 
          @change="onImageChange"
          :max-count="1"
        >
          <div v-if="fileList.length < 1" class="upload-placeholder">
            <PlusOutlined />
            <div style="margin-top: 8px">Ajouter une photo</div>
          </div>
        </a-upload>
        
        <a-modal 
          v-model:open="previewVisible" 
          :title="previewTitle" 
          :footer="null" 
          @cancel="handleCancel"
          centered
        >
          <img alt="Aperçu" style="width: 100%" :src="previewImage" />
        </a-modal>
      </div>
    </a-form-item>

    <!-- Submit Button -->
    <a-form-item style="margin-bottom: 0;">
      <a-button 
        type="primary" 
        html-type="submit" 
        block 
        size="large" 
        :loading="submitting"
        :disabled="submitting"
        class="submit-btn"
      >
        <template #icon v-if="!submitting">
          <SaveOutlined />
        </template>
        {{ submitting ? 'Enregistrement...' : 'Enregistrer l\'article' }}
      </a-button>
    </a-form-item>
  </a-form>

  <!-- Success Modal -->
  <a-modal 
    v-model:open="showSuccessModal" 
    title="✅ Enregistrement réussi" 
    @ok="resetForm"
    :ok-text="'Nouveau'"
    :cancel-text="'Fermer'"
    centered
  >
    <a-result status="success" style="padding: 0;">
      <template #title>
        Article enregistré avec succès!
      </template>
      <template #subTitle>
        <div class="success-details">
          <p><strong>Code article:</strong> {{ savedId }}</p>
          <p><strong>Propriétaire:</strong> {{ form.owner }}</p>
          <p><strong>Prix:</strong> {{ formatNumber(form.price) }} FCFA</p>
        </div>
      </template>
    </a-result>
  </a-modal>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import dayjs, { Dayjs } from 'dayjs'
import { useItemsStore } from '../../store/itemsStore'
import { useAuthStore } from '../../store/auth'
import { getTypes } from '../../store/types'
import { 
  PlusOutlined, 
  DeleteOutlined, 
  PhoneOutlined,
  CheckCircleOutlined,
  SaveOutlined
} from '@ant-design/icons-vue'
import type { UploadFile, UploadChangeParam } from 'ant-design-vue'
import { message } from 'ant-design-vue'

const emit = defineEmits<{
  success: [itemId: string]
  error: [error: string]
}>()

const itemsStore = useItemsStore()
const authStore = useAuthStore()

// Form state
type FormData = {
  items: Array<{ type: string; qty: number; notes?: string }>
  owner: string
  contact: string
  price: number
  date_received: Dayjs
  date_promised: Dayjs
  notes?: string
  amountGiven?: number
}

const types = getTypes()
const defaultPromisedDays = 7

const createDefaultFormState = (): FormData => ({
  items: [{ type: types.value[0]?.name || '', qty: 1, notes: '' }],
  owner: '',
  contact: '',
  price: 0,
  date_received: dayjs(),
  date_promised: dayjs().add(defaultPromisedDays, 'day'),
  notes: '',
  amountGiven: 0,
})

const form = reactive<FormData>(createDefaultFormState())

// Image upload state
const previewVisible = ref(false)
const previewImage = ref('')
const previewTitle = ref('')
const fileList = ref<UploadFile[]>([])
const imageDataUrl = ref<string | null>(null)

// Other state
const submitting = ref(false)
const showSuccessModal = ref(false)
const savedId = ref('')

// Computed
const change = computed(() => {
  const amountGiven = form.amountGiven || 0
  return amountGiven >= form.price && form.price > 0 ? amountGiven - form.price : 0
})

// Methods
function addItem() {
  form.items.push({ type: types.value[0]?.name || '', qty: 1, notes: '' })
}

function removeItem(idx: number) {
  if (form.items.length > 1) {
    form.items.splice(idx, 1)
  }
}

function calcChange() {
  // Change is computed automatically
}

function formatCurrency(value: string | number | undefined): string {
  if (!value) return ''
  return formatNumber(Number(value))
}

function parseCurrency(value: string | undefined): string {
  if (!value) return ''
  return value.replace(/\D/g, '')
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat('fr-FR').format(num)
}

// Image handling
const handleCancel = () => {
  previewVisible.value = false
}

const handlePreview = async (file: UploadFile) => {
  if (!file.url && !file.preview) {
    if (file.originFileObj) {
      file.preview = await getBase64(file.originFileObj) as string
    }
  }
  previewImage.value = file.url || file.preview || ''
  previewVisible.value = true
  previewTitle.value = file.name || (file.url ? file.url.substring(file.url.lastIndexOf('/') + 1) : '')
}

function getBase64(file: File): Promise<string | ArrayBuffer | null> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })
}

function onImageChange({ file, fileList: newFileList }: UploadChangeParam) {
  fileList.value = newFileList
  if (file.status === 'removed') {
    imageDataUrl.value = null
  } else if (file.originFileObj) {
    getBase64(file.originFileObj).then(data => {
      imageDataUrl.value = data as string
    })
  }
}

// Form submission
async function onSubmit() {
  if (submitting.value) return

  // Validation
  if (!authStore.isAuthenticated || !authStore.user) {
    message.error('Vous devez être connecté pour enregistrer un article.')
    return
  }

  if (!form.owner.trim()) {
    message.warning('Le nom du propriétaire est requis.')
    return
  }

  if (!form.contact.trim()) {
    message.warning('Le numéro de contact est requis.')
    return
  }

  if (form.price <= 0) {
    message.warning('Le prix doit être supérieur à 0.')
    return
  }

  const validItems = form.items.filter(i => i.type && i.type.trim())
  if (validItems.length === 0) {
    message.warning('Ajoutez au moins un article avec un type sélectionné.')
    return
  }

  // Validate contact
  const cleanContact = form.contact.trim().replace(/\s+/g, '')
  const contactRegex = /^(\+237)?6?\d{8}$/
  if (!contactRegex.test(cleanContact)) {
    message.warning('Format de contact invalide. Exemple: 6xxxxxxxx')
    return
  }

  // Validate amount given
  const amountGiven = form.amountGiven || 0
  if (amountGiven > form.price) {
    message.warning('Le montant reçu ne peut pas être supérieur au prix.')
    return
  }

  submitting.value = true

  try {
    const itemData = {
      items: validItems.map(i => ({
        type: i.type.trim(),
        qty: i.qty,
        ...(i.notes?.trim() && { notes: i.notes.trim() })
      })),
      owner: form.owner.trim(),
      contact: cleanContact,
      price: form.price,
      amountGiven,
      date_received: form.date_received.toISOString(),
      date_promised: form.date_promised.toISOString(),
      ...(form.notes?.trim() && { notes: form.notes.trim() }),
      ...(imageDataUrl.value && { image: imageDataUrl.value })
    }

    const result = await itemsStore.createItem(itemData)
    savedId.value = result.id
    showSuccessModal.value = true
    emit('success', result.id)

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    emit('error', errorMessage)
  } finally {
    submitting.value = false
  }
}

function resetForm() {
  Object.assign(form, createDefaultFormState())
  fileList.value = []
  imageDataUrl.value = null
  savedId.value = ''
  showSuccessModal.value = false
}
</script>

<style scoped>
.items-section {
  background: #fafafa;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

.item-row {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
  padding: 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
}

.item-type-select {
  flex: 2;
  min-width: 120px;
}

.item-qty-input {
  flex: 1;
  min-width: 80px;
}

.item-notes-input {
  flex: 2;
  min-width: 150px;
}

.remove-item-btn {
  flex-shrink: 0;
}

.add-item-btn {
  margin-top: 8px;
  border-style: dashed;
  border-color: #d9d9d9;
}

.add-item-btn:hover {
  border-color: #1677ff;
  color: #1677ff;
}

.change-display {
  margin-top: 8px;
  padding: 8px;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 4px;
  color: #52c41a;
  font-size: 14px;
}

.upload-section {
  text-align: center;
}

.upload-placeholder {
  color: #666;
  font-size: 14px;
}

.submit-btn {
  height: 50px;
  font-size: 16px;
  font-weight: 500;
}

.success-details {
  text-align: left;
  margin-top: 16px;
}

.success-details p {
  margin: 8px 0;
  font-size: 14px;
}

/* Transitions */
.item-list-enter-active,
.item-list-leave-active {
  transition: all 0.3s ease;
}

.item-list-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.item-list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

/* Responsive */
@media (max-width: 768px) {
  .item-row {
    flex-direction: column;
    gap: 8px;
  }

  .item-type-select,
  .item-qty-input,
  .item-notes-input {
    width: 100%;
  }

  .remove-item-btn {
    align-self: flex-end;
  }
}
</style>
