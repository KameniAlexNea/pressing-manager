import localforage from 'localforage'
import dayjs from 'dayjs'
import { v4 as uuidv4 } from 'uuid'

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
  image?: string | null // base64 or data URL
  amountGiven?: number | null // payment at registration
}

const DB_KEY = 'pressing_items'
localforage.config({ name: 'pressing-manager' })


export async function getAll(): Promise<ClothingItem[]> {
  const arr = (await localforage.getItem<ClothingItem[]>(DB_KEY)) || []
  return arr
}

async function saveAll(items: ClothingItem[]): Promise<void> {
  // Save only plain objects, not Vue refs/reactives
  const plain = items.map(i => ({ ...i, items: i.items ? i.items.map(x => ({ ...x })) : [] }))
  await localforage.setItem(DB_KEY, plain)
}

export async function createItem(data: Partial<ClothingItem>): Promise<ClothingItem> {
  const all = await getAll()
  const item: ClothingItem = {
    id: uuidv4(),
    items: data.items || [],
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
    image: data.image || null,
    amountGiven: typeof data.amountGiven === 'number' ? data.amountGiven : null,
  }
  all.push(item)
  await saveAll(all)
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

export async function exportItems(): Promise<string> {
  const items = await getAll()
  return JSON.stringify({ version: 1, exported_at: new Date().toISOString(), items }, null, 2)
}

export async function importItems(json: string): Promise<void> {
  const data = JSON.parse(json)
  if (!data || !Array.isArray(data.items)) throw new Error('Invalid file')
  await saveAll(data.items as ClothingItem[])
}

export async function clearItems(): Promise<void> {
  await saveAll([])
}
