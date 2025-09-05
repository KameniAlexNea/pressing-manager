<template>
  <a-card title="Enregistrer un article" style="max-width:600px;margin:auto">
    <a-form layout="vertical" @submit.prevent="onSubmit">
      <a-form-item label="Description">
        <a-input v-model:value="form.description" required />
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

type FormT = {
  description: string
  owner: string
  contact?: string
  price: number
  date_received?: Dayjs
  date_promised?: Dayjs
  notes?: string
}

const defaultPromisedDays = 7
const form = reactive<FormT>({
  description: '',
  owner: '',
  contact: '',
  price: 0,
  date_received: dayjs(),
  date_promised: dayjs().add(defaultPromisedDays, 'day'),
  notes: ''
})

const savedId = ref<string>('')

async function onSubmit() {
  const res = await createItem({
    description: form.description,
    owner: form.owner,
    contact: form.contact,
    price: form.price,
    date_received: form.date_received?.toISOString(),
    date_promised: form.date_promised?.toISOString(),
    notes: form.notes,
    image: imageDataUrl.value || undefined,
  })
  savedId.value = res.id
}
</script>
