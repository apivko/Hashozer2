<template>
  <div v-if="isVisible" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <h3>פרטי הזמנה</h3>
      <ul>
        <li v-for="(value, key) in orderDetails" :key="key">
          <strong>{{ key }}:</strong> {{ value }}
        </li>
        <li v-if="orderDetails.address">
          <strong>כתובת:</strong> {{ orderDetails.address }}
        </li>
      </ul>
      <button @click="closeModal">סגור</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { mockOrders } from '../mocks/mockOrders';

const props = defineProps({
  orderDetails: Object,
  isVisible: Boolean
});

const emit = defineEmits(['close']);

function closeModal() {
  emit('close');
}

if (import.meta.env.MODE === 'development') {
  props.orderDetails = mockOrders[0]; // Use the first mock order for testing
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
  direction: rtl;
  text-align: right;
}

button {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #4a5568;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #2d3748;
}
</style> 