<template>
  <div class="item-detail-card">
    <h2>{{ item.description }}</h2>
    <img v-if="item.image" :src="item.image" alt="Item Image" class="item-image" />
    <div class="item-info">
      <p><strong>Owner:</strong> {{ item.owner }}</p>
      <p><strong>Price:</strong> {{ formatPrice(item.price) }}</p>
      <p><strong>Status:</strong> {{ item.status }}</p>
      <p><strong>Date Received:</strong> {{ formatDate(item.date_received) }}</p>
      <p v-if="item.date_cleaned"><strong>Date Cleaned:</strong> {{ formatDate(item.date_cleaned) }}</p>
      <p v-if="item.date_delivered"><strong>Date Delivered:</strong> {{ formatDate(item.date_delivered) }}</p>
      <p v-if="item.notes"><strong>Notes:</strong> {{ item.notes }}</p>
    </div>
    <div class="item-lines" v-if="item.items && item.items.length">
      <h3>Item Lines</h3>
      <ul>
        <li v-for="(line, index) in item.items" :key="index">
          {{ line.qty }} x {{ line.type }} <span v-if="line.notes">({{ line.notes }})</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useFormatting } from '@/composables/useFormatting';
import { ClothingItem } from '@/store/types';

export default defineComponent({
  name: 'ItemDetailCard',
  props: {
    item: {
      type: Object as () => ClothingItem,
      required: true
    }
  },
  setup() {
    const { formatPrice, formatDate } = useFormatting();

    return {
      formatPrice,
      formatDate
    };
  }
});
</script>

<style scoped>
.item-detail-card {
  border: 1px solid #ccc;
  padding: 16px;
  border-radius: 8px;
  background-color: #fff;
}

.item-image {
  max-width: 100%;
  height: auto;
}

.item-info {
  margin: 16px 0;
}

.item-lines {
  margin-top: 16px;
}
</style>