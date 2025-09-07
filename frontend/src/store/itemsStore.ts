import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
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
  userId?: string
}

export type ClothingItemWithDeadline = ClothingItem & { days_left: number | null }

export interface SearchFilters {
  query: string
  status: string[]
  itemType: string[]
  dateReceivedFrom: string | null
  dateReceivedTo: string | null
  datePromisedFrom: string | null
  datePromisedTo: string | null
  priceMin: number | null
  priceMax: number | null
}

interface ItemsState {
  items: ClothingItem[]
  filteredItems: ClothingItem[]
  currentItem: ClothingItem | null
  loading: boolean
  error: string | null
  searchFilters: SearchFilters
  lastFetch: number | null
}

const COLLECTION_NAME = 'clothing_items'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export const useItemsStore = defineStore('items', () => {
  // State
  const state = ref<ItemsState>({
    items: [],
    filteredItems: [],
    currentItem: null,
    loading: false,
    error: null,
    searchFilters: {
      query: '',
      status: [],
      itemType: [],
      dateReceivedFrom: null,
      dateReceivedTo: null,
      datePromisedFrom: null,
      datePromisedTo: null,
      priceMin: null,
      priceMax: null
    },
    lastFetch: null
  })

  // Getters
  const items = computed(() => state.value.items)
  const filteredItems = computed(() => state.value.filteredItems)
  const currentItem = computed(() => state.value.currentItem)
  const loading = computed(() => state.value.loading)
  const error = computed(() => state.value.error)
  const hasItems = computed(() => state.value.items.length > 0)
  
  const stats = computed(() => {
    const total = state.value.items.length
    const received = state.value.items.filter(i => i.status === 'received').length
    const cleaned = state.value.items.filter(i => i.status === 'cleaned').length
    const delivered = state.value.items.filter(i => i.status === 'delivered').length
    
    return {
      total_items: total,
      received_items: received,
      cleaned_items: cleaned,
      delivered_items: delivered,
      pending_items: received + cleaned
    }
  })

  const itemsByStatus = computed(() => {
    return {
      received: state.value.items.filter(i => i.status === 'received'),
      cleaned: state.value.items.filter(i => i.status === 'cleaned'),
      delivered: state.value.items.filter(i => i.status === 'delivered')
    }
  })

  // Helper functions
  function getCurrentUserId(): string {
    const authStore = useAuthStore()
    if (!authStore.user?.uid) {
      throw new Error('User not authenticated')
    }
    return authStore.user.uid
  }

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

  function setLoading(value: boolean) {
    state.value.loading = value
  }

  function setError(error: string | null) {
    state.value.error = error
  }

  function shouldRefetch(): boolean {
    if (!state.value.lastFetch) return true
    return Date.now() - state.value.lastFetch > CACHE_DURATION
  }

  // Actions
  async function fetchAllItems(forceRefresh = false): Promise<void> {
    if (!forceRefresh && !shouldRefetch()) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const userId = getCurrentUserId()
      const q = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId),
        orderBy('date_received', 'desc')
      )

      const querySnapshot = await getDocs(q)
      console.log('Total items found:', querySnapshot.size)

      const fetchedItems = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date_received: timestampToString(doc.data().date_received),
        date_cleaned: doc.data().date_cleaned ? timestampToString(doc.data().date_cleaned) : null,
        date_delivered: doc.data().date_delivered ? timestampToString(doc.data().date_delivered) : null,
        date_promised: doc.data().date_promised ? timestampToString(doc.data().date_promised) : null,
      })) as ClothingItem[]

      state.value.items = fetchedItems
      state.value.lastFetch = Date.now()
      
      // Apply current filters
      applyFilters()

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des articles'
      console.error('Error fetching items:', err)
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  async function fetchItemById(id: string): Promise<ClothingItem | null> {
    setLoading(true)
    setError(null)

    try {
      // First try to find in cache
      const cachedItem = state.value.items.find(item => item.id === id)
      if (cachedItem) {
        state.value.currentItem = cachedItem
        return cachedItem
      }

      // Fetch from Firebase
      const userId = getCurrentUserId()
      const itemDoc = await getDoc(doc(db, COLLECTION_NAME, id))
      
      if (!itemDoc.exists()) {
        state.value.currentItem = null
        return null
      }

      const itemData = itemDoc.data()
      
      // Verify ownership
      if (itemData.userId !== userId) {
        throw new Error('Accès non autorisé à cet article')
      }

      const item: ClothingItem = {
        id: itemDoc.id,
        ...itemData,
        date_received: timestampToString(itemData.date_received),
        date_cleaned: itemData.date_cleaned ? timestampToString(itemData.date_cleaned) : null,
        date_delivered: itemData.date_delivered ? timestampToString(itemData.date_delivered) : null,
        date_promised: itemData.date_promised ? timestampToString(itemData.date_promised) : null,
      } as ClothingItem

      state.value.currentItem = item
      return item

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement de l\'article'
      console.error('Error fetching item:', err)
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  async function createItem(data: Partial<ClothingItem>): Promise<ClothingItem> {
    setLoading(true)
    setError(null)

    try {
      const userId = getCurrentUserId()
      console.log('Creating item:', data)
      
      // Clean up undefined values
      function cleanObject(obj: any): any {
        if (obj === null || obj === undefined) return null
        if (Array.isArray(obj)) {
          return obj.map(cleanObject)
        }
        if (typeof obj === 'object') {
          const cleaned: any = {}
          Object.keys(obj).forEach(key => {
            const value = cleanObject(obj[key])
            if (value !== undefined) {
              cleaned[key] = value
            }
          })
          return cleaned
        }
        return obj
      }

      const cleanedData = cleanObject(data)
      const docData = {
        ...cleanedData,
        userId,
        status: 'received',
        date_received: cleanedData.date_received ? new Date(cleanedData.date_received) : new Date(),
        date_promised: cleanedData.date_promised ? new Date(cleanedData.date_promised) : null,
        date_cleaned: null,
        date_delivered: null,
      }

      // Generate description from items
      if (cleanedData.items && cleanedData.items.length > 0) {
        docData.description = cleanedData.items
          .map((item: ItemLine) => `${item.qty}x ${item.type}${item.notes ? ` (${item.notes})` : ''}`)
          .join(', ')
      }

      delete docData.id // Remove id field

      const docRef = await addDoc(collection(db, COLLECTION_NAME), docData)
      
      const newItem: ClothingItem = {
        id: docRef.id,
        ...cleanedData,
        userId,
        status: 'received',
        date_received: timestampToString(docData.date_received),
        date_promised: docData.date_promised ? timestampToString(docData.date_promised) : null,
        date_cleaned: null,
        date_delivered: null,
        description: docData.description
      } as ClothingItem

      // Add to local state
      state.value.items.unshift(newItem)
      state.value.currentItem = newItem
      
      // Apply filters to update filtered list
      applyFilters()

      return newItem

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création de l\'article'
      console.error('Error creating item:', err)
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  async function updateItemStatus(id: string, status: 'cleaned' | 'delivered'): Promise<ClothingItem | null> {
    setLoading(true)
    setError(null)

    try {
      const docRef = doc(db, COLLECTION_NAME, id)
      const now = new Date()
      
      const updateData: any = { status }
      
      if (status === 'cleaned') {
        updateData.date_cleaned = now
      } else if (status === 'delivered') {
        updateData.date_delivered = now
      }

      await updateDoc(docRef, updateData)

      // Update local state
      const itemIndex = state.value.items.findIndex(item => item.id === id)
      if (itemIndex !== -1) {
        const updatedItem = {
          ...state.value.items[itemIndex],
          status,
          ...(status === 'cleaned' && { date_cleaned: now.toISOString() }),
          ...(status === 'delivered' && { date_delivered: now.toISOString() })
        }
        
        state.value.items[itemIndex] = updatedItem
        
        if (state.value.currentItem?.id === id) {
          state.value.currentItem = updatedItem
        }

        // Apply filters to update filtered list
        applyFilters()

        return updatedItem
      }

      return null

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du statut'
      console.error('Error updating item status:', err)
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  function applyFilters() {
    const filters = state.value.searchFilters
    let filtered = [...state.value.items]

    // Text search
    if (filters.query) {
      const query = filters.query.toLowerCase()
      filtered = filtered.filter(item => 
        item.owner.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query) ||
        item.contact?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.notes?.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(item => filters.status.includes(item.status))
    }

    // Item type filter
    if (filters.itemType.length > 0) {
      filtered = filtered.filter(item => 
        item.items?.some(i => filters.itemType.includes(i.type)) ||
        filters.itemType.some(type => item.description?.includes(type))
      )
    }

    // Date filters
    if (filters.dateReceivedFrom) {
      filtered = filtered.filter(item => 
        dayjs(item.date_received).isAfter(dayjs(filters.dateReceivedFrom), 'day') ||
        dayjs(item.date_received).isSame(dayjs(filters.dateReceivedFrom), 'day')
      )
    }

    if (filters.dateReceivedTo) {
      filtered = filtered.filter(item => 
        dayjs(item.date_received).isBefore(dayjs(filters.dateReceivedTo), 'day') ||
        dayjs(item.date_received).isSame(dayjs(filters.dateReceivedTo), 'day')
      )
    }

    if (filters.datePromisedFrom && filters.datePromisedTo) {
      filtered = filtered.filter(item => {
        if (!item.date_promised) return false
        const promisedDate = dayjs(item.date_promised)
        return (
          (promisedDate.isAfter(dayjs(filters.datePromisedFrom), 'day') ||
           promisedDate.isSame(dayjs(filters.datePromisedFrom), 'day')) &&
          (promisedDate.isBefore(dayjs(filters.datePromisedTo), 'day') ||
           promisedDate.isSame(dayjs(filters.datePromisedTo), 'day'))
        )
      })
    }

    // Price filters
    if (filters.priceMin !== null) {
      filtered = filtered.filter(item => item.price >= filters.priceMin!)
    }

    if (filters.priceMax !== null) {
      filtered = filtered.filter(item => item.price <= filters.priceMax!)
    }

    state.value.filteredItems = filtered
  }

  function setSearchFilters(filters: Partial<SearchFilters>) {
    state.value.searchFilters = { ...state.value.searchFilters, ...filters }
    applyFilters()
  }

  function clearFilters() {
    state.value.searchFilters = {
      query: '',
      status: [],
      itemType: [],
      dateReceivedFrom: null,
      dateReceivedTo: null,
      datePromisedFrom: null,
      datePromisedTo: null,
      priceMin: null,
      priceMax: null
    }
    applyFilters()
  }

  function getItemsByOwner(owner: string): ClothingItem[] {
    return state.value.items.filter(item => 
      item.owner.toLowerCase().includes(owner.toLowerCase())
    )
  }

  function getItemsWithDeadlines(): ClothingItemWithDeadline[] {
    return state.value.items
      .filter(item => item.date_promised && item.status !== 'delivered')
      .map(item => {
        const promisedDate = dayjs(item.date_promised)
        const today = dayjs()
        const days_left = promisedDate.diff(today, 'day')
        
        return {
          ...item,
          days_left
        }
      })
      .sort((a, b) => (a.days_left || 0) - (b.days_left || 0))
  }

  async function exportItems(): Promise<string> {
    if (!hasItems.value) {
      await fetchAllItems()
    }
    return JSON.stringify(state.value.items, null, 2)
  }

  async function importItems(json: string): Promise<void> {
    setLoading(true)
    setError(null)

    try {
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
        delete (itemData as any).id
        batch.set(docRef, itemData)
      })

      await batch.commit()
      
      // Refresh items after import
      await fetchAllItems(true)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'importation'
      console.error('Error importing items:', err)
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  async function clearAllItems(): Promise<void> {
    setLoading(true)
    setError(null)

    try {
      const batch = writeBatch(db)

      state.value.items.forEach(item => {
        const docRef = doc(db, COLLECTION_NAME, item.id)
        batch.delete(docRef)
      })

      await batch.commit()
      
      // Clear local state
      state.value.items = []
      state.value.filteredItems = []
      state.value.currentItem = null
      state.value.lastFetch = null

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression'
      console.error('Error clearing items:', err)
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    // State
    items,
    filteredItems,
    currentItem,
    loading,
    error,
    hasItems,
    stats,
    itemsByStatus,
    searchFilters: computed(() => state.value.searchFilters),

    // Actions
    fetchAllItems,
    fetchItemById,
    createItem,
    updateItemStatus,
    setSearchFilters,
    clearFilters,
    applyFilters,
    getItemsByOwner,
    getItemsWithDeadlines,
    exportItems,
    importItems,
    clearAllItems,
    
    // Utilities
    setLoading,
    setError
  }
})

// Legacy functions for backward compatibility
export const getAll = () => {
  const store = useItemsStore()
  return store.fetchAllItems().then(() => store.items)
}

export const getById = (id: string) => {
  const store = useItemsStore()
  return store.fetchItemById(id)
}

export const createItem = (data: Partial<ClothingItem>) => {
  const store = useItemsStore()
  return store.createItem(data)
}

export const updateStatus = (id: string, status: 'cleaned' | 'delivered') => {
  const store = useItemsStore()
  return store.updateItemStatus(id, status)
}

export const getStats = () => {
  const store = useItemsStore()
  return Promise.resolve(store.stats)
}

export const getByOwner = (owner: string) => {
  const store = useItemsStore()
  return Promise.resolve(store.getItemsByOwner(owner))
}

export const getWithDeadlines = (owner?: string) => {
  const store = useItemsStore()
  let items = store.getItemsWithDeadlines()
  
  if (owner) {
    items = items.filter(item => 
      item.owner.toLowerCase().includes(owner.toLowerCase())
    )
  }
  
  return Promise.resolve(items)
}

export const exportItems = () => {
  const store = useItemsStore()
  return store.exportItems()
}

export const importItems = (json: string) => {
  const store = useItemsStore()
  return store.importItems(json)
}

export const clearItems = () => {
  const store = useItemsStore()
  return store.clearAllItems()
}
