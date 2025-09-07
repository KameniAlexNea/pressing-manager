import { useAuthStore } from './auth'
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
  orderBy,
  writeBatch
} from 'firebase/firestore'
import dayjs from 'dayjs'

export type ItemLine = {
  type: string
  qty: number
  notes?: string
}

export type ClothingItem = {
  id: string
  items?: ItemLine[]
  description?: string
  owner: string
  price: number
  status: 'received' | 'cleaned' | 'delivered'
  date_received: string
  date_cleaned?: string | null
  date_delivered?: string | null
  notes?: string | null
  contact?: string | null
  date_promised?: string | null
  image?: string | null
  amountGiven?: number | null
  userId?: string // Add userId to associate with the authenticated user
}

export type ClothingItemWithDeadline = ClothingItem & { days_left: number | null }

// Collection name
const COLLECTION_NAME = 'clothing_items'

// Helper function to get current user ID
function getCurrentUserId(): string {
  const authStore = useAuthStore()
  if (!authStore.user?.uid) {
    throw new Error('User not authenticated')
  }
  return authStore.user.uid
}

// Convert Firestore timestamp to ISO string
function timestampToString(timestamp: any): string {
  if (!timestamp) return ''
  if (timestamp.toDate) {
    return timestamp.toDate().toISOString()
  }
  if (timestamp instanceof Date) {
    return timestamp.toISOString()
  }
  return timestamp.toString()
}

export async function getAll(): Promise<ClothingItem[]> {
  const userId = getCurrentUserId()
  console.log('Getting all items for userId:', userId)

  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId),
    orderBy('date_received', 'desc')
  )

  const querySnapshot = await getDocs(q)
  console.log('Total items found:', querySnapshot.size)

  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    date_received: timestampToString(doc.data().date_received),
    date_cleaned: doc.data().date_cleaned ? timestampToString(doc.data().date_cleaned) : null,
    date_delivered: doc.data().date_delivered ? timestampToString(doc.data().date_delivered) : null,
    date_promised: doc.data().date_promised ? timestampToString(doc.data().date_promised) : null,
  })) as ClothingItem[]
}

export async function createItem(data: Partial<ClothingItem>): Promise<ClothingItem> {
  try {
    const userId = getCurrentUserId()
    console.log('Creating item with userId:', userId)
    console.log('Item data:', data)
    
    // Clean up undefined values recursively - Firebase doesn't allow undefined
    function cleanObject(obj: any): any {
      if (obj === null || obj === undefined) return null
      if (Array.isArray(obj)) {
        return obj.map(cleanObject)
      }
      if (typeof obj === 'object') {
        const cleaned: any = {}
        for (const [key, value] of Object.entries(obj)) {
          if (value !== undefined) {
            cleaned[key] = cleanObject(value)
          }
        }
        return cleaned
      }
      return obj
    }
    
    const cleanData = cleanObject(data)
    
    const itemData = {
      ...cleanData,
      userId,
      status: 'received' as const,
      date_received: data.date_received ? new Date(data.date_received) : new Date(),
      date_promised: data.date_promised ? new Date(data.date_promised) : null,
      date_cleaned: null,
      date_delivered: null,
    }
    
    console.log('Processed item data:', itemData)

    const docRef = await addDoc(collection(db, COLLECTION_NAME), itemData)
    console.log('Document created with ID:', docRef.id)

    return {
      id: docRef.id,
      ...cleanData,
      userId,
      status: 'received',
      date_received: itemData.date_received.toISOString(),
      date_promised: itemData.date_promised?.toISOString() || null,
      date_cleaned: null,
      date_delivered: null,
    } as ClothingItem
  } catch (error) {
    console.error('Error creating item:', error)
    throw error
  }
}

export async function getById(id: string): Promise<ClothingItem | undefined> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      return {
        id: docSnap.id,
        ...data,
        date_received: timestampToString(data.date_received),
        date_cleaned: data.date_cleaned ? timestampToString(data.date_cleaned) : null,
        date_delivered: data.date_delivered ? timestampToString(data.date_delivered) : null,
        date_promised: data.date_promised ? timestampToString(data.date_promised) : null,
      } as ClothingItem
    }
    return undefined
  } catch (error) {
    console.error('Error getting item:', error)
    return undefined
  }
}

export async function getByOwner(owner: string): Promise<ClothingItem[]> {
  const userId = getCurrentUserId()
  console.log('Searching for items:', { owner, userId })

  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId),
    where('owner', '==', owner),
    orderBy('date_received', 'desc')
  )

  const querySnapshot = await getDocs(q)
  console.log('Query snapshot size:', querySnapshot.size)
  console.log('Query docs:', querySnapshot.docs.map(doc => ({ id: doc.id, data: doc.data() })))

  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    date_received: timestampToString(doc.data().date_received),
    date_cleaned: doc.data().date_cleaned ? timestampToString(doc.data().date_cleaned) : null,
    date_delivered: doc.data().date_delivered ? timestampToString(doc.data().date_delivered) : null,
    date_promised: doc.data().date_promised ? timestampToString(doc.data().date_promised) : null,
  })) as ClothingItem[]
}

export async function getPendingOlderThan(days: number): Promise<ClothingItem[]> {
  const items = await getAll()
  const cutoff = dayjs().subtract(days, 'day')
  return items.filter(i => i.status !== 'delivered' && dayjs(i.date_received).isBefore(cutoff))
}

export async function getWithDeadlines(owner?: string): Promise<ClothingItemWithDeadline[]> {
  const items = owner ? await getByOwner(owner) : await getAll()

  return items.map(item => {
    let days_left: number | null = null
    if (item.date_promised) {
      const promisedDate = dayjs(item.date_promised)
      const today = dayjs()
      days_left = promisedDate.diff(today, 'day')
    }

    return {
      ...item,
      days_left
    }
  })
}

export async function updateStatus(id: string, status: ClothingItem['status']): Promise<ClothingItem | undefined> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    const updateData: any = { status }

    // Set timestamp based on status
    if (status === 'cleaned') {
      updateData.date_cleaned = new Date()
    } else if (status === 'delivered') {
      updateData.date_delivered = new Date()
    }

    await updateDoc(docRef, updateData)

    // Return updated item
    return await getById(id)
  } catch (error) {
    console.error('Error updating status:', error)
    return undefined
  }
}

export async function getStats() {
  const items = await getAll()

  // Calculate total revenue from all items
  const total_revenue = items.reduce((sum, item) => {
    const price = typeof item.price === 'number' ? item.price : 0
    return sum + price
  }, 0)

  return {
    total_items: items.length,
    received_items: items.filter(i => i.status === 'received').length,
    cleaned_items: items.filter(i => i.status === 'cleaned').length,
    delivered_items: items.filter(i => i.status === 'delivered').length,
    pending_items: items.filter(i => i.status !== 'delivered').length,
    total_revenue: total_revenue
  }
}

export async function exportItems(): Promise<string> {
  const items = await getAll()
  return JSON.stringify(items, null, 2)
}

export async function importItems(json: string): Promise<void> {
  const data = JSON.parse(json) as ClothingItem[]
  const userId = getCurrentUserId()

  const batch = writeBatch(db)

  data.forEach(item => {
    const docRef = doc(collection(db, COLLECTION_NAME))
    const itemData = {
      ...item,
      userId,
      date_received: new Date(item.date_received),
      date_cleaned: item.date_cleaned ? new Date(item.date_cleaned) : null,
      date_delivered: item.date_delivered ? new Date(item.date_delivered) : null,
      date_promised: item.date_promised ? new Date(item.date_promised) : null,
    }
    delete (itemData as any).id // Remove id as it will be auto-generated
    batch.set(docRef, itemData)
  })

  await batch.commit()
}

export async function clearItems(): Promise<void> {
  const items = await getAll()
  const batch = writeBatch(db)

  items.forEach(item => {
    const docRef = doc(db, COLLECTION_NAME, item.id)
    batch.delete(docRef)
  })

  await batch.commit()
}
