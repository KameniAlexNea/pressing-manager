import localforage from 'localforage'
import dayjs from 'dayjs'
import { v4 as uuidv4 } from 'uuid'

export type ClothingItem = {
  id: string
  description: string
  owner: string
  price: number
  status: 'received' | 'cleaned' | 'delivered'
  date_received: string
  date_cleaned?: string | null
  date_delivered?: string | null
  notes?: string | null
  contact?: string | null
  date_promised?: string | null
}

const DB_KEY = 'pressing_items'
localforage.config({ name: 'pressing-manager' })

async function getAll(): Promise<ClothingItem[]> {
  const arr = (await localforage.getItem<ClothingItem[]>(DB_KEY)) || []
  return arr
}

async function saveAll(items: ClothingItem[]): Promise<void> {
  await localforage.setItem(DB_KEY, items)
}

export async function createItem(data: Partial<ClothingItem>): Promise<ClothingItem> {
  const items = await getAll()
  const item: ClothingItem = {
    id: uuidv4(),
    description: data.description || '',
    owner: (data.owner || '').toUpperCase(),
    price: Number(data.price || 0),
    status: 'received',
    date_received: data.date_received || dayjs().toISOString(),
    date_cleaned: null,
    date_delivered: null,
    notes: data.notes || null,
    contact: data.contact || null,
    date_promised: data.date_promised || dayjs().add(7, 'day').toISOString(),
  }
  items.push(item)
  await saveAll(items)
  return item
}

export async function getById(id: string): Promise<ClothingItem | undefined> {
  const items = await getAll()
  return items.find(i => i.id === id)
}

export async function getByOwner(owner: string): Promise<ClothingItem[]> {
  const items = await getAll()
  return items.filter(i => i.owner === owner.toUpperCase())
}

export async function getPendingOlderThan(days: number): Promise<ClothingItem[]> {
  const items = await getAll()
  const cutoff = dayjs().subtract(days, 'day')
  return items.filter(i => i.status !== 'cleaned' && dayjs(i.date_received).isBefore(cutoff))
}

export async function getWithDeadlines(owner?: string): Promise<(ClothingItem & { days_left: number | null })[]> {
  const items = await getAll()
  const list = items.filter(i => !!i.date_promised && (!owner || i.owner === owner.toUpperCase()))
  return list.map(i => ({
    ...i,
    days_left: i.date_promised ? dayjs(i.date_promised).diff(dayjs(), 'day') : null,
  }))
}

export async function updateStatus(id: string, status: ClothingItem['status']): Promise<ClothingItem | undefined> {
  const items = await getAll()
  const idx = items.findIndex(i => i.id === id)
  if (idx === -1) return undefined
  items[idx].status = status
  if (status === 'cleaned') items[idx].date_cleaned = dayjs().toISOString()
  if (status === 'delivered') items[idx].date_delivered = dayjs().toISOString()
  await saveAll(items)
  return items[idx]
}

export async function getStats() {
  const items = await getAll()
  const total_items = items.length
  const cleaned_items = items.filter(i => i.status === 'cleaned').length
  const delivered_items = items.filter(i => i.status === 'delivered').length
  const pending_items = items.filter(i => i.status === 'received').length
  const total_revenue = items.filter(i => i.status === 'delivered').reduce((s, i) => s + (i.price || 0), 0)
  return { total_items, cleaned_items, delivered_items, pending_items, total_revenue }
}
