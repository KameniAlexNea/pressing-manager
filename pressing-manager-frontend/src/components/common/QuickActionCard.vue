<template>
  <div class="quick-action-card">
    <h3 class="title">Quick Actions</h3>
    <div class="actions">
      <button @click="onAddItem" class="action-button">Add Item</button>
      <button @click="onManageStores" class="action-button">Manage Stores</button>
      <button @click="onInviteManager" class="action-button">Invite Manager</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'QuickActionCard',
  methods: {
    onAddItem() {
      this.$emit('add-item');
    },
    onManageStores() {
      this.$emit('manage-stores');
    },
    onInviteManager() {
      this.$emit('invite-manager');
    }
  }
});
</script>

<style scoped>
.quick-action-card {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 16px;
  background-color: #f9f9f9;
}

.title {
  font-size: 1.5em;
  margin-bottom: 12px;
}

.actions {
  display: flex;
  flex-direction: column;
}

.action-button {
  margin: 8px 0;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.action-button:hover {
  background-color: #0056b3;
}
</style>