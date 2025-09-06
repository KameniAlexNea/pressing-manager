// Simple store for clothing types
import { ref, watch } from 'vue'
import localforage from 'localforage'

export type ClothingType = {
  id: string
  name: string
}

const defaultTypes: ClothingType[] = [
  { id: 'chemise', name: 'Chemise' },
  { id: 'pantalon', name: 'Pantalon' },
  { id: 'costume', name: 'Costume' },
]

const types = ref<ClothingType[]>([])
const DB_KEY = 'pressing_types'

async function loadTypes() {
  const saved = await localforage.getItem<ClothingType[]>(DB_KEY)
  types.value = saved && saved.length ? saved : [...defaultTypes]
}
loadTypes()

watch(types, () => {
  // Always save a plain array, not a Vue ref or reactive object
  localforage.setItem(DB_KEY, types.value.map(t => ({ ...t })))
}, { deep: true })

export function getTypes() {
  return types
}

export function addType(name: string) {
  const id = name.toLowerCase().replace(/\s+/g, '-')
  if (!types.value.find(t => t.id === id)) {
    types.value.push({ id, name })
  }
}

export function removeType(id: string) {
  types.value = types.value.filter(t => t.id !== id)
}

export function editType(id: string, name: string) {
  const t = types.value.find(t => t.id === id)
  if (t) t.name = name
}

export function resetTypes() {
  types.value = [...defaultTypes]
}
