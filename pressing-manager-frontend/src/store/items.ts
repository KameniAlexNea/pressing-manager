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
  orderBy
} from 'firebase/firestore'
import dayjs from 'dayjs'

export type ItemLine = {
  type: string
  qty: number
  notes?: string
}

export type StoreItem = {
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
  storeId: string // Associate item with a specific store
}

export type StoreItemWithDeadline = StoreItem & { days_left: number | null }

// Collection name
const COLLECTION_NAME = 'store_items'

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

export async function getAll(storeId: string): Promise<StoreItem[]> {
  const userId = getCurrentUserId()

  const q = query(
    collection(db, COLLECTION_NAME),
    where('storeId', '==', storeId),
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
  })) as StoreItem[]
}

export async function createItem(storeId: string, data: Partial<StoreItem>): Promise<StoreItem> {
  try {
    const userId = getCurrentUserId()
    console.log('Item data:', data)
    
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
      owner: userId,
      storeId,
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
      owner: userId,
      storeId,
      status: 'received',
      date_received: itemData.date_received.toISOString(),
      date_promised: itemData.date_promised?.toISOString() || null,
      date_cleaned: null,
      date_delivered: null,
    } as StoreItem
  } catch (error) {
    console.error('Error creating item:', error)
    throw error
  }
}

export async function getById(id: string): Promise<StoreItem | undefined> {
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
      } as StoreItem
    }
    return undefined
  } catch (error) {
    console.error('Error getting item:', error)
    return undefined
  }
}

export async function getByOwner(owner: string, storeId: string): Promise<StoreItem[]> {
  const userId = getCurrentUserId()
  console.log('Searching for items:', { owner, userId })

  const q = query(
    collection(db, COLLECTION_NAME),
    where('storeId', '==', storeId),
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
  })) as StoreItem[]
}

export async function getPendingOlderThan(storeId: string, days: number): Promise<StoreItem[]> {
  const items = await getAll(storeId)
  const cutoff = dayjs().subtract(days, 'day')
  return items.filter(i => i.status !== 'delivered' && dayjs(i.date_received).isBefore(cutoff))
}

export async function getWithDeadlines(storeId: string, owner?: string): Promise<StoreItemWithDeadline[]> {
  const items = owner ? await getByOwner(owner, storeId) : await getAll(storeId)

  const filteredItems = items.filter(item =>
    item.status !== 'delivered' &&
    item.date_promised &&
    item.status !== 'cleaned'
  )

  return filteredItems.map(item => {
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

export async function updateStatus(id: string, status: StoreItem['status']): Promise<StoreItem | undefined> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    const updateData: any = { status }

    if (status === 'cleaned') {
      updateData.date_cleaned = new Date()
    } else if (status === 'delivered') {
      updateData.date_delivered = new Date()
    }

    await updateDoc(docRef, updateData)

    return await getById(id)
  } catch (error) {
    console.error('Error updating status:', error)
    return undefined
  }
}

export async function updateItemsList(id: string, items: ItemLine[]): Promise<StoreItem | undefined> {
  try {
    const currentItem = await getById(id)
    if (!currentItem) {
      throw new Error('Item not found')
    }
    if (currentItem.status === 'delivered') {
      throw new Error('Cannot modify an already delivered item')
    }

    const cleanedItems = items
      .filter(item => item.type && item.type.trim())
      .map(item => {
        const cleanItem: any = {
          type: item.type.trim(),
          qty: item.qty
        }
        if (item.notes && item.notes.trim()) {
          cleanItem.notes = item.notes.trim()
        }
        return cleanItem
      })

    if (cleanedItems.length === 0) {
      throw new Error('At least one item must be specified')
    }

    const docRef = doc(db, COLLECTION_NAME, id)
    await updateDoc(docRef, { items: cleanedItems })

    return await getById(id)
  } catch (error) {
    console.error('Error updating items list:', error)
    throw error
  }
}

export async function getStats(storeId: string) {
  const items = await getAll(storeId)

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