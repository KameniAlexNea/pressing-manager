<template>
  <a-card title="Enregistrer un article" style="max-width:600px;margin:auto">
    <a-form layout="vertical" @submit.prevent="onSubmit">
      <a-form-item label="Articles à enregistrer">
        <div v-for="(item, idx) in form.items" :key="idx" style="display:flex; gap:8px; align-items:center; margin-bottom:4px;">
          <a-select v-model:value="item.type" style="width:120px">
            <a-select-option v-for="t in types" :key="t.id" :value="t.name">{{ t.name }}</a-select-option>
          </a-select>
          <a-input-number v-model:value="item.qty" :min="1" style="width:60px" />
          <a-input v-model:value="item.notes" placeholder="Notes" style="width:120px" />
          <a-button danger size="small" @click="removeItem(idx)">Supprimer</a-button>
        </div>
        <a-button size="small" @click="addItem">Ajouter un article</a-button>
      </a-form-item>
      <a-form-item label="Propriétaire">
        <a-input v-model:value="form.owner" required />
      </a-form-item>
      <a-form-item label="Contact (+237...)">
        <a-input v-model:value="form.contact" />
      </a-form-item>
      <a-form-item label="Prix">
        <a-input-number v-model:value="form.price" :min="0" style="width:100%" />
      </a-form-item>
      <a-form-item label="Montant donné (optionnel)">
        <a-input-number v-model:value="form.amountGiven" :min="0" style="width:100%" @change="calcChange" />
        <div v-if="form.amountGiven && form.amountGiven >= form.price" style="margin-top:0.5em;">
          <span>Monnaie à rendre : <strong>{{ change }}</strong> FCFA</span>
        </div>
      </a-form-item>
      <a-form-item label="Date de réception">
        <a-date-picker show-time v-model:value="form.date_received" style="width:100%" />
      </a-form-item>
      <a-form-item label="Date promise">
        <a-date-picker show-time v-model:value="form.date_promised" style="width:100%" />
      </a-form-item>
      <a-form-item label="Notes">
        <a-textarea v-model:value="form.notes" rows="3" />
      </a-form-item>
      <a-form-item label="Photo (optionnelle)">
        <input
          type="file"
          accept="image/*"
          capture="environment"
          @change="onImageChange"
        />
        <div v-if="imageDataUrl" style="margin-top: 0.5em;">
          <img :src="imageDataUrl" alt="Aperçu vêtement" style="max-width: 200px; max-height: 200px; border: 1px solid #ccc;" />
        </div>
      </a-form-item>
      <a-button type="primary" html-type="submit" block>Enregistrer</a-button>
    </a-form>
    <a-divider />
    <div v-if="savedId">Enregistré. Code: <strong>{{ savedId }}</strong></div>
  </a-card>
</template>

<script setup lang="ts">
import dayjs, { Dayjs } from 'dayjs'
import { reactive, ref } from 'vue'
import { createItem } from '../store/items'
import { getTypes } from '../store/types'

// Optional image upload
const imageFile = ref<File|null>(null)
const imageDataUrl = ref<string|null>(null)

function onImageChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    imageFile.value = target.files[0]
    const reader = new FileReader()
    reader.onload = e => {
      imageDataUrl.value = e.target?.result as string
    }
    reader.readAsDataURL(target.files[0])
  } else {
    imageFile.value = null
    imageDataUrl.value = null
  }
}

// Clothing types
const types = getTypes()

type ItemLine = {
  type: string
  qty: number
  notes?: string
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
const form = reactive<FormT>({
  items: [ { type: types[0]?.name || '', qty: 1, notes: '' } ],
  owner: '',
  contact: '',
  price: 0,
  date_received: dayjs(),
  date_promised: dayjs().add(defaultPromisedDays, 'day'),
  notes: '',
  amountGiven: undefined,
})

function addItem() {
  form.items.push({ type: types[0]?.name || '', qty: 1, notes: '' })
}
function removeItem(idx: number) {
  if (form.items.length > 1) form.items.splice(idx, 1)
}

const change = ref<number>(0)

function calcChange() {
  if (form.amountGiven && form.amountGiven >= form.price) {
    change.value = form.amountGiven - form.price
  } else {
    change.value = 0
  }
}

const savedId = ref<string>('')

async function onSubmit() {
  const res = await createItem({
    items: form.items,
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
}
</script>
