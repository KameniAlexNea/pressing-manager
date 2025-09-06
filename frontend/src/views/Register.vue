<template>
  <a-card title="Enregistrer un article" :bordered="false">
    <a-form layout="vertical" @submit.prevent="onSubmit">
      <a-form-item label="Articles">
        <div v-for="(item, idx) in form.items" :key="idx" class="item-row">
          <a-select v-model:value="item.type" placeholder="Type" style="flex: 2;">
            <a-select-option v-for="t in types" :key="t.id" :value="t.name">{{ t.name }}</a-select-option>
          </a-select>
          <a-input-number v-model:value="item.qty" :min="1" placeholder="Qté" style="flex: 1;" />
          <a-button danger @click="removeItem(idx)" :disabled="form.items.length === 1">
            <template #icon>
              <DeleteOutlined />
            </template>
          </a-button>
        </div>
        <a-button type="dashed" block @click="addItem" style="margin-top: 8px;">
          <template #icon>
            <PlusOutlined />
          </template>
          Ajouter un article
        </a-button>
      </a-form-item>

      <a-form-item label="Propriétaire"
        :rules="[{ required: true, message: 'Veuillez entrer le nom du propriétaire' }]">
        <a-input v-model:value="form.owner" />
      </a-form-item>

      <a-form-item label="Contact (+237...)">
        <a-input v-model:value="form.contact" />
      </a-form-item>

      <a-form-item label="Prix" :rules="[{ required: true, message: 'Veuillez entrer un prix' }]">
        <a-input-number v-model:value="form.price" :min="0" style="width:100%" addon-after="FCFA" />
      </a-form-item>

      <a-form-item label="Montant donné">
        <a-input-number v-model:value="form.amountGiven" :min="0" style="width:100%" addon-after="FCFA"
          @change="calcChange" />
        <div v-if="change > 0" style="margin-top: 8px; color: green;">
          Monnaie à rendre : <strong>{{ change }} FCFA</strong>
        </div>
      </a-form-item>

      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="Date de réception">
            <a-date-picker show-time v-model:value="form.date_received" style="width:100%" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="Date promise">
            <a-date-picker show-time v-model:value="form.date_promised" style="width:100%" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-form-item label="Notes">
        <a-textarea v-model:value="form.notes" rows="3" />
      </a-form-item>

      <a-form-item label="Photo (optionnelle)">
        <a-upload v-model:file-list="fileList" list-type="picture-card" :before-upload="() => false"
          @preview="handlePreview" @change="onImageChange">
          <div v-if="fileList.length < 1">
            <PlusOutlined />
            <div style="margin-top: 8px">Upload</div>
          </div>
        </a-upload>
        <a-modal :open="previewVisible" :title="previewTitle" :footer="null" @cancel="handleCancel">
          <img alt="example" style="width: 100%" :src="previewImage" />
        </a-modal>
      </a-form-item>

      <a-button type="primary" html-type="submit" block size="large">Enregistrer</a-button>
    </a-form>

    <a-modal v-model:open="showSuccessModal" title="Enregistrement réussi" @ok="resetForm">
      <p>L'article a été enregistré avec succès.</p>
      <p>Code de l'article : <strong>{{ savedId }}</strong></p>
    </a-modal>
  </a-card>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import dayjs, { Dayjs } from 'dayjs'
import { createItem } from '../store/items'
import { getTypes } from '../store/types'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import type { UploadFile, UploadChangeParam } from 'ant-design-vue';

// Image Upload state
const previewVisible = ref(false);
const previewImage = ref('');
const previewTitle = ref('');
const fileList = ref<UploadFile[]>([]);
const imageDataUrl = ref<string | null>(null)

const handleCancel = () => {
  previewVisible.value = false;
};
const handlePreview = async (file: UploadFile) => {
  if (!file.url && !file.preview) {
    if (file.originFileObj) {
      file.preview = await getBase64(file.originFileObj) as string;
    }
  }
  previewImage.value = file.url || file.preview || '';
  previewVisible.value = true;
  previewTitle.value = file.name || (file.url ? file.url.substring(file.url.lastIndexOf('/') + 1) : '');
};

function getBase64(file: File): Promise<string | ArrayBuffer | null> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

function onImageChange({ file, fileList: newFileList }: UploadChangeParam) {
  fileList.value = newFileList;
  if (file.status === 'removed') {
    imageDataUrl.value = null;
  } else {
    if (file.originFileObj) {
      getBase64(file.originFileObj).then(data => {
        imageDataUrl.value = data as string;
      });
    }
  }
}

// Clothing types
const types = getTypes()

type ItemLine = {
  type: string
  qty: number
}
type FormT = {
  items: ItemLine[]
  owner: string
  contact?: string
  price: number
  date_received?: Dayjs
  date_promised?: Dayjs
  notes?: string
  amountGiven?: number
}

const defaultPromisedDays = 7
const createDefaultFormState = (): FormT => ({
  items: [{ type: types[0]?.name || '', qty: 1 }],
  owner: '',
  contact: '',
  price: 0,
  date_received: dayjs(),
  date_promised: dayjs().add(defaultPromisedDays, 'day'),
  notes: '',
  amountGiven: undefined,
})

const form = reactive<FormT>(createDefaultFormState())

function addItem() {
  form.items.push({ type: types[0]?.name || '', qty: 1 })
}
function removeItem(idx: number) {
  if (form.items.length > 1) form.items.splice(idx, 1)
}

const change = ref<number>(0)

function calcChange() {
  if (form.amountGiven && form.price && form.amountGiven >= form.price) {
    change.value = form.amountGiven - form.price
  } else {
    change.value = 0
  }
}

const savedId = ref<string>('')
const showSuccessModal = ref(false)

async function onSubmit() {
  if (!form.owner || form.price <= 0) {
    // Basic validation
    return;
  }
  const res = await createItem({
    items: form.items.map(i => ({ ...i, notes: '' })), // notes not used in this form version
    owner: form.owner,
    contact: form.contact,
    price: form.price,
    date_received: form.date_received?.toISOString(),
    date_promised: form.date_promised?.toISOString(),
    notes: form.notes,
    image: imageDataUrl.value || undefined,
    amountGiven: form.amountGiven,
  })
  savedId.value = res.id
  showSuccessModal.value = true
}

function resetForm() {
  Object.assign(form, createDefaultFormState());
  fileList.value = [];
  imageDataUrl.value = null;
  change.value = 0;
  savedId.value = '';
  showSuccessModal.value = false;
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
