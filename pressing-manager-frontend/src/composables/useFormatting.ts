import { ref } from 'vue';

export function useFormatting() {
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatItemStatus = (status: string): string => {
    const statusMap: { [key: string]: string } = {
      received: 'Received',
      cleaned: 'Cleaned',
      delivered: 'Delivered',
    };
    return statusMap[status] || 'Unknown Status';
  };

  return {
    formatCurrency,
    formatDate,
    formatItemStatus,
  };
}