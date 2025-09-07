// Simple store for clothing types using Firebase
import { ref, watch } from 'vue'
import { db } from '../firebase'
import {
  collection,
  doc,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore'
import { useAuthStore } from './auth'

export type ClothingType = {
  id: string
  name: string
  userId?: string
}

const defaultTypes: ClothingType[] = [
  { id: 'chemise', name: 'Chemise' },
  { id: 'pantalon', name: 'Pantalon' },
  { id: 'costume', name: 'Costume' },
]

const types = ref<ClothingType[]>([])
const COLLECTION_NAME = 'clothing_types'

// Helper function to get current user ID
function getCurrentUserId(): string {
  const authStore = useAuthStore()
  if (!authStore.user?.uid) {
    throw new Error('User not authenticated')
  }
  return authStore.user.uid
}

async function loadTypes() {
  try {
    const userId = getCurrentUserId()
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      orderBy('name')
    )

    const querySnapshot = await getDocs(q)
    const savedTypes = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ClothingType[]

    types.value = savedTypes.length ? savedTypes : await createDefaultTypes()
  } catch (error) {
    console.error('Error loading types:', error)
    types.value = [...defaultTypes]
  }
}

async function createDefaultTypes(): Promise<ClothingType[]> {
  const userId = getCurrentUserId()
  const createdTypes: ClothingType[] = []

  for (const type of defaultTypes) {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        name: type.name,
        userId
      })
      createdTypes.push({
        id: docRef.id,
        name: type.name,
        userId
      })
    } catch (error) {
      console.error('Error creating default type:', error)
    }
  }

  return createdTypes
}

export function getTypes() {
  return types
}

// Initialize types - call this function from a component after auth is ready
export function initializeTypes() {
  const authStore = useAuthStore()
  watch(() => authStore.user, (user) => {
    if (user) {
      loadTypes()
    } else {
      types.value = []
    }
  }, { immediate: true })
}

export async function addType(name: string) {
  try {
    const userId = getCurrentUserId()
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      name,
      userId
    })

    const newType = {
      id: docRef.id,
      name,
      userId
    }

    types.value.push(newType)
  } catch (error) {
    console.error('Error adding type:', error)
    throw error
  }
}

export async function removeType(id: string) {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id))
    types.value = types.value.filter(t => t.id !== id)
  } catch (error) {
    console.error('Error removing type:', error)
    throw error
  }
}

export async function editType(id: string, name: string) {
  try {
    await updateDoc(doc(db, COLLECTION_NAME, id), { name })
    const type = types.value.find(t => t.id === id)
    if (type) {
      type.name = name
    }
  } catch (error) {
    console.error('Error editing type:', error)
    throw error
  }
}

export async function resetTypes() {
  try {
    // Remove all current types
    for (const type of types.value) {
      await deleteDoc(doc(db, COLLECTION_NAME, type.id))
    }

    // Create default types
    types.value = await createDefaultTypes()
  } catch (error) {
    console.error('Error resetting types:', error)
    throw error
  }
}
