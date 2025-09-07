# Components

This folder contains reusable Vue components organized by category.

## Structure

```
components/
├── common/           # Shared/common components
│   ├── GlobalSearch.vue     # Global search with advanced filters
│   └── LoadingWrapper.vue   # Loading/error state wrapper
├── items/            # Item-related components
│   ├── ItemCard.vue         # Individual item display card
│   └── ItemList.vue         # List of items with pagination
└── index.ts          # Component exports
```

## Usage

### Import individual components
```vue
import { GlobalSearch, ItemCard, LoadingWrapper } from '@/components'
```

### Or import from specific locations
```vue
import GlobalSearch from '@/components/common/GlobalSearch.vue'
import ItemCard from '@/components/items/ItemCard.vue'
```

## Component Features

### GlobalSearch
- Text search across multiple fields
- Advanced filters (status, type, dates, price)
- Real-time filtering
- Mobile responsive

### ItemCard  
- Rich item display with status, dates, pricing
- Action buttons for status changes
- Image preview
- Deadline warnings
- Mobile optimized layout

### ItemList
- Paginated list of ItemCard components
- Loading states
- Empty states with custom messages
- Bulk actions support

### LoadingWrapper
- Handles loading, error, and success states
- Skeleton loading option
- Retry functionality
- Customizable error messages

## Best Practices

1. **Props**: Always define props with TypeScript interfaces
2. **Events**: Use `defineEmits` with typed events
3. **Slots**: Provide meaningful slot names and document them
4. **Accessibility**: Include ARIA labels and keyboard support
5. **Responsive**: Test on mobile and desktop breakpoints
6. **Performance**: Use `computed` for derived data, avoid unnecessary re-renders
