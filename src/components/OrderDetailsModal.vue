<template>
  <div v-if="isVisible" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <h3>פרטי הזמנה</h3>
      
      <div class="order-details">
        <div class="detail-row">
          <strong>שם הלקוח:</strong>
          <span>{{ orderDetails.customerName || orderDetails.name }}</span>
        </div>
        
        <div class="detail-row">
          <strong>כתובת:</strong>
          <span>{{ orderDetails.customerAddress || orderDetails.address }}</span>
        </div>
        
        <div class="detail-row">
          <strong>טלפון:</strong>
          <span>{{ orderDetails.customerPhone || orderDetails.phoneNumber }}</span>
        </div>
        
        <div class="detail-row">
          <strong>פריטים:</strong>
          <div class="items-list">
            <div v-for="(item, index) in orderDetails.items" :key="index" class="item">
              <span>{{ item.name || item.itemName }}</span>
              <span class="quantity">כמות: {{ item.quantity }}</span>
              <span class="price">{{ item.price }}₪</span>
            </div>
          </div>
        </div>
        
        <div class="detail-row">
          <strong>סה"כ פרחים:</strong>
          <div class="flowers-summary">
            <div v-if="totalFlowersUsed.length > 0">
              <div v-for="flower in totalFlowersUsed" :key="flower.name" class="flower-item">
                <span>{{ flower.name }}</span>
                <span class="quantity">{{ flower.quantity }} יחידות</span>
              </div>
            </div>
            <div v-else class="no-flowers">
              <span>אין מידע על פרחים</span>
            </div>
          </div>
        </div>
        
        <div class="detail-row total">
          <strong>סה"כ לתשלום:</strong>
          <span>{{ orderDetails.totalPrice || orderDetails.totalAmount }}</span>
        </div>
      </div>
      
      <button @click="closeModal">סגור</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { getDatabase, ref as dbRef, get } from 'firebase/database';

const props = defineProps({
  orderDetails: Object,
  isVisible: Boolean
});

const emit = defineEmits(['close']);

const db = getDatabase();
const flowerItems = ref([]);

// Load flower items from Firebase
const loadFlowerItems = async () => {
  try {
    const itemsSnapshot = await get(dbRef(db, 'flower_items'));
    if (itemsSnapshot.exists()) {
      flowerItems.value = Object.entries(itemsSnapshot.val()).map(([id, data]) => ({
        id,
        ...data
      }));
    }
  } catch (error) {
    console.error('Error loading flower items:', error);
  }
};

// Calculate total flowers used in the order
const totalFlowersUsed = computed(() => {
  if (!props.orderDetails?.items || !flowerItems.value.length) {
    return [];
  }

  const flowerCounts = {};

  props.orderDetails.items.forEach(orderItem => {
    // Find the corresponding flower item to get its ingredients
    const flowerItem = flowerItems.value.find(item => 
      item.name === orderItem.name || item.id === orderItem.id
    );

    if (flowerItem && flowerItem.ingredients) {
      // For each ingredient in the flower item, multiply by the order quantity
      flowerItem.ingredients.forEach(ingredient => {
        const flowerName = ingredient.name;
        const totalQuantity = ingredient.quantity * (orderItem.quantity ?? 1);
        
        if (flowerCounts[flowerName]) {
          flowerCounts[flowerName] += totalQuantity;
        } else {
          flowerCounts[flowerName] = totalQuantity;
        }
      });
    }
  });

  // Convert to array format for display
  return Object.entries(flowerCounts).map(([name, quantity]) => ({
    name,
    quantity
  }));
});

function closeModal() {
  emit('close');
}

// Load flower items when modal becomes visible
watch(() => props.isVisible, (newValue) => {
  if (newValue) {
    loadFlowerItems();
  }
});

// Also load on mount in case modal is already visible
onMounted(() => {
  if (props.isVisible) {
    loadFlowerItems();
  }
});
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

.order-details {
  margin: 20px 0;
}

.detail-row {
  margin-bottom: 15px;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row strong {
  display: block;
  margin-bottom: 5px;
  color: #4a5568;
  font-weight: 600;
}

.detail-row span {
  display: block;
  color: #2d3748;
}

.items-list {
  margin-top: 10px;
}

.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f7fafc;
}

.item:last-child {
  border-bottom: none;
}

.item .quantity {
  color: #718096;
  font-size: 0.9em;
}

.item .price {
  font-weight: 600;
  color: #2d3748;
}

.flowers-summary {
  margin-top: 10px;
}

.flower-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
  border-bottom: 1px solid #f7fafc;
}

.flower-item:last-child {
  border-bottom: none;
}

.flower-item .quantity {
  color: #718096;
  font-size: 0.9em;
}

.no-flowers {
  color: #718096;
  font-style: italic;
  text-align: center;
  padding: 10px 0;
}

.total {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 2px solid #4a5568;
  font-size: 1.1em;
}

.total strong {
  color: #2d3748;
}

.total span {
  font-weight: 600;
  color: #2d3748;
}

button {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #4a5568;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
}

button:hover {
  background-color: #2d3748;
}
</style> 