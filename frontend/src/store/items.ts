import { useAuthStore } from './auth'
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
}

export type ClothingItemWithDeadline = ClothingItem & { days_left: number | null }

const API_BASE = '/api'

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const authStore = useAuthStore()
  const authHeaders = authStore.getAuthHeaders()
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }
  
  // Add any existing headers from options
  if (options.headers) {
    Object.assign(headers, options.headers)
  }
  
  // Only add auth header if it exists
  if (authHeaders && authHeaders.Authorization) {
    headers.Authorization = authHeaders.Authorization
  }
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  })
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`)
  }
  
  return response.json()
}

export async function getAll(): Promise<ClothingItem[]> {
  return apiRequest('/items')
}

export async function createItem(data: Partial<ClothingItem>): Promise<ClothingItem> {
  return apiRequest('/items', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

export async function getById(id: string): Promise<ClothingItem | undefined> {
  try {
    return await apiRequest(`/items/${id}`)
  } catch {
    return undefined
  }
}

export async function getByOwner(owner: string): Promise<ClothingItem[]> {
  return apiRequest(`/items?owner=${encodeURIComponent(owner)}`)
}

export async function getPendingOlderThan(days: number): Promise<ClothingItem[]> {
  const items = await getAll()
  const cutoff = dayjs().subtract(days, 'day')
  return items.filter(i => i.status !== 'delivered' && dayjs(i.date_received).isBefore(cutoff))
}

export async function getWithDeadlines(owner?: string): Promise<ClothingItemWithDeadline[]> {
  const params = owner ? `?owner=${encodeURIComponent(owner)}` : ''
  return apiRequest(`/items/deadlines${params}`)
}

export async function updateStatus(id: string, status: ClothingItem['status']): Promise<ClothingItem | undefined> {
  try {
    return await apiRequest(`/items/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(status)
    })
  } catch {
    return undefined
  }
}

export async function getStats() {
  return apiRequest('/stats')
}

export async function exportItems(): Promise<string> {
  const data = await apiRequest('/items/export')
  return JSON.stringify(data, null, 2)
}

export async function importItems(json: string): Promise<void> {
  const data = JSON.parse(json)
  await apiRequest('/items/import', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

export async function clearItems(): Promise<void> {
  await apiRequest('/items/clear', { method: 'POST' })
}
