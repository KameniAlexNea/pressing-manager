import { db } from '../firebase'
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore'

// Collection name
const STORES_COLLECTION = 'stores'

// Function to get all stores associated with the current user
export async function getStoresByUserId(userId: string) {
  const q = query(
    collection(db, STORES_COLLECTION),
    where('userIds', 'array-contains', userId),
    orderBy('name')
  )

  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
}

// Function to get a specific store by ID
export async function getStoreById(storeId: string) {
  const docRef = doc(db, STORES_COLLECTION, storeId)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data()
    }
  }
  return undefined
}

// Function to create a new store
export async function createStore(data: { name: string; userIds: string[] }) {
  const docRef = await addDoc(collection(db, STORES_COLLECTION), data)
  return {
    id: docRef.id,
    ...data
  }
}

// Function to update store details
export async function updateStore(storeId: string, data: Partial<{ name: string; userIds: string[] }>) {
  const docRef = doc(db, STORES_COLLECTION, storeId)
  await updateDoc(docRef, data)
  return getStoreById(storeId)
}

// Function to invite a manager to a store
export async function inviteManager(storeId: string, email: string) {
  // Logic to send an invitation email to the manager
  // This could involve calling a cloud function or an external service
}