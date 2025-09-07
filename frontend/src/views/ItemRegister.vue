<template>
    <a-card title="Enregistrer un article" :bordered="false">
        <a-form layout="vertical" @submit.prevent="onSubmit">
            <a-form-item label="Articles">
                <div v-for="(item, idx) in form.items" :key="idx" class="item-row">
                    <a-select v-model:value="item.type" placeholder="Type" style="flex: 2;"
                        :aria-label="`Type d'article ligne ${idx + 1}`">
                        <a-select-option v-for="t in types" :key="t.id" :value="t.name">{{ t.name }}</a-select-option>
                    </a-select>
                    <a-input-number v-model:value="item.qty" :min="1" placeholder="Qté" style="flex: 1;"
                        :aria-label="`Quantité ligne ${idx + 1}`" />
                    <a-input v-model:value="item.notes" placeholder="Note (code, couleur, etc.)" style="flex: 2;"
                        :aria-label="`Note ligne ${idx + 1}`" />
                    <a-button danger @click="removeItem(idx)" :disabled="form.items.length === 1"
                        :aria-label="`Supprimer ligne ${idx + 1}`">
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
                <a-input v-model:value="form.owner" aria-label="Nom du propriétaire" />
            </a-form-item>

            <a-form-item label="Contact (+237...)"
                :rules="[{ required: true, message: 'Veuillez entrer un numéro de contact' }]">
                <a-input v-model:value="form.contact" aria-label="Numéro de contact" />
            </a-form-item>

            <a-form-item label="Prix"
                :rules="[{ required: true, message: 'Veuillez entrer un prix' }, { type: 'number', min: 1, message: 'Le prix doit être supérieur à 0' }]">
                <a-input-number v-model:value="form.price" :min="1" style="width:100%" addon-after="FCFA"
                    aria-label="Prix" />
            </a-form-item>

            <a-form-item label="Montant donné">
                <a-input-number v-model:value="form.amountGiven" :min="0" style="width:100%" addon-after="FCFA"
                    @change="calcChange" aria-label="Montant donné" />
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
                <a-textarea v-model:value="form.notes" rows=3 aria-label="Notes générales" />
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

            <a-button type="primary" html-type="submit" block size="large" :loading="loading"
                :disabled="loading">Enregistrer</a-button>
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
import { createItem, type ItemLine } from '../store/items'
import { useAuthStore } from '../store/auth'
import { getTypes } from '../store/types'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import type { UploadFile, UploadChangeParam } from 'ant-design-vue';

const authStore = useAuthStore()

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
    items: [{ type: types.value[0]?.name || '', qty: 1, notes: '' }],
    owner: '',
    contact: '',
    price: 0,
    date_received: dayjs(),
    date_promised: dayjs().add(defaultPromisedDays, 'day'),
    notes: '',
    amountGiven: 0,
})

const form = reactive<FormT>(createDefaultFormState())

function addItem() {
    form.items.push({ type: types.value[0]?.name || '', qty: 1, notes: '' })
}
function removeItem(idx: number) {
    if (form.items.length > 1) form.items.splice(idx, 1)
}

const change = ref<number>(0)

function calcChange() {
    const amountGiven = form.amountGiven || 0
    if (amountGiven >= form.price && form.price > 0) {
        change.value = amountGiven - form.price
    } else {
        change.value = 0
    }
}

const savedId = ref<string>('')
const showSuccessModal = ref(false)
const loading = ref(false)

import { message } from 'ant-design-vue'

async function onSubmit() {
    if (loading.value) return;
    
    // Check authentication
    if (!authStore.isAuthenticated || !authStore.user) {
        message.error('Vous devez être connecté pour enregistrer un article.')
        return;
    }
    
    if (!form.owner || form.price <= 0) {
        message.warning('Veuillez remplir tous les champs obligatoires.')
        return;
    }
    
    // Check if there's at least one valid item
    const validItems = form.items.filter(i => i.type && i.type.trim())
    if (validItems.length === 0) {
        message.warning('Veuillez ajouter au moins un article avec un type sélectionné.')
        return;
    }
    
    // Validate date received (should not be in the future)
    if (form.date_received && form.date_received.isAfter(dayjs())) {
        message.warning('La date de réception ne peut pas être dans le futur.')
        return;
    }
    
    // Validate contact number (Cameroon format: 6xxxxxxxx or xxxxxxxx with 8-9 digits)
    if (form.contact && form.contact.trim()) {
        const cleanContact = form.contact.trim().replace(/\s+/g, '') // Remove spaces
        const contactRegex = /^(\+237)?6?\d{8}$/ // Optional +237, optional 6, then 8 digits
        if (!contactRegex.test(cleanContact)) {
            message.warning('Le numéro de contact doit être au format camerounais (ex: 6xxxxxxxx ou xxxxxxxx avec 8-9 chiffres).')
            return;
        }
    }
    
    // Set amount given to 0 if empty, and validate it's not greater than price
    const amountGiven = form.amountGiven || 0
    if (amountGiven > form.price) {
        message.warning('Le montant donné ne peut pas être supérieur au prix.')
        return;
    }
    
    loading.value = true;
    try {
        console.log('Submitting form data:', form)
        
        // Prepare data and remove undefined values
        const itemData: any = {
            items: form.items
                .filter(i => i.type && i.type.trim()) // Only include items with a valid type
                .map(i => {
                    const cleanItem: any = {
                        type: i.type.trim(),
                        qty: i.qty
                    }
                    // Only add notes if it has a value
                    if (i.notes && i.notes.trim()) {
                        cleanItem.notes = i.notes.trim()
                    }
                    return cleanItem
                }),
            owner: form.owner,
            price: form.price,
            amountGiven: amountGiven, // Always include amount given (default to 0)
        }
        
        // Only add optional fields if they have values
        if (form.contact) itemData.contact = form.contact.trim()
        if (form.date_received) itemData.date_received = form.date_received.toISOString()
        if (form.date_promised) itemData.date_promised = form.date_promised.toISOString()
        if (form.notes) itemData.notes = form.notes
        if (imageDataUrl.value) itemData.image = imageDataUrl.value
        
        console.log('Cleaned item data:', itemData)
        
        const res = await createItem(itemData)
        savedId.value = res.id
        showSuccessModal.value = true
        message.success('Article enregistré avec succès.')
    } catch (e) {
        console.error('Registration error:', e)
        message.error(`Erreur lors de l'enregistrement de l'article: ${e instanceof Error ? e.message : 'Erreur inconnue'}`)
    } finally {
        loading.value = false;
    }
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
