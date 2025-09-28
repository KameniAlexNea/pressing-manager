<template>
  <div class="item-view">
    <ItemDetailCard :item="item" v-if="item" />
    <LoadingWrapper v-else />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getById } from '../store/items';
import ItemDetailCard from '../components/items/ItemDetailCard.vue';
import LoadingWrapper from '../components/common/LoadingWrapper.vue';

export default defineComponent({
  components: {
    ItemDetailCard,
    LoadingWrapper,
  },
  setup() {
    const route = useRoute();
    const item = ref(null);

    const fetchItem = async () => {
      const itemId = route.params.id as string;
      item.value = await getById(itemId);
    };

    onMounted(fetchItem);

    return {
      item,
    };
  },
});
</script>

<style scoped>
.item-view {
  padding: 20px;
}
</style>