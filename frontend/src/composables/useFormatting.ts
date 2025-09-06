import dayjs from 'dayjs'
import { useRouter } from 'vue-router'

export function useFormatting() {
  function formatDate(date?: string | Date): string {
    return date ? dayjs(date).format('DD/MM/YYYY HH:mm') : 'N/A'
  }
  function statusColor(status: string) {
    switch (status) {
      case 'received': return 'blue';
      case 'cleaned': return 'orange';
      case 'delivered': return 'green';
      default: return 'default';
    }
  }
  return { formatDate, statusColor }
}

export function useNavigation() {
  const router = useRouter()
  function goToItem(id: string) {
    router.push(`/item?id=${id}`)
  }
  return { goToItem }
}
