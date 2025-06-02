<!-- OrdersTab.vue -->
<template>
  <div id="orders" class="tab-content active">
    <div class="item-form">
      <h2>הזמנה חדשה</h2>
      <div class="flex-row">
        <input v-model="orderData.customerName" placeholder="שם הלקוח" />
        <input v-model="orderData.customerPhone" placeholder="טלפון" type="tel" />
      </div>
      <div class="flex-row">
        <input v-model="orderData.customerAddress" placeholder="כתובת למשלוח" />
        <input v-model="orderData.deliveryDate" type="datetime-local" placeholder="תאריך ושעת משלוח" />
      </div>
      <div class="flex-row">
        <input 
          v-model="searchItem"
          @input="searchItems"
          placeholder="חפש פריט להוספה"
          list="items-list"
        />
        <button @click="addItemToOrder">הוסף פריט</button>
      </div>
      <datalist id="items-list">
        <option v-for="item in filteredItems" :key="item.id" :value="item.name">
          {{ item.name }} - {{ item.price }}₪
        </option>
      </datalist>
      
      <div class="order-items" id="orderItemsList">
        <div v-for="(item, index) in orderItems" :key="index" class="order-item">
          <div class="order-item-details">
            <span>{{ item.name }}</span>
            <span>{{ item.price }}₪</span>
          </div>
          <div class="order-item-actions">
            <button @click="removeItem(index)" class="remove-button">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
      
      <div class="summary" id="orderSummary">
        סה"כ: {{ totalPrice }}₪
      </div>
      <button @click="submitOrder">שמור הזמנה</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getDatabase, ref as dbRef, push, get } from 'firebase/database'

const db = getDatabase()

// State
const orderData = ref({
  customerName: '',
  customerPhone: '',
  customerAddress: '',
  deliveryDate: '',
})

const orderItems = ref([])
const searchItem = ref('')
const items = ref([])
const filteredItems = ref([])

// Load items from Firebase
const loadItems = async () => {
  try {
    const itemsSnapshot = await get(dbRef(db, 'flower_items'))
    if (itemsSnapshot.exists()) {
      items.value = Object.entries(itemsSnapshot.val()).map(([id, data]) => ({
        id,
        ...data
      }))
    }
  } catch (error) {
    console.error('Error loading items:', error)
  }
}

// Search items
const searchItems = () => {
  if (!searchItem.value) {
    filteredItems.value = []
    return
  }
  
  filteredItems.value = items.value.filter(item =>
    item.name.includes(searchItem.value)
  )
}

// Add item to order
const addItemToOrder = () => {
  const selectedItem = items.value.find(item => item.name === searchItem.value)
  if (selectedItem) {
    orderItems.value.push({
      id: selectedItem.id,
      name: selectedItem.name,
      price: selectedItem.price
    })
    searchItem.value = ''
    filteredItems.value = []
  }
}

// Remove item from order
const removeItem = (index) => {
  orderItems.value.splice(index, 1)
}

// Calculate total price
const totalPrice = computed(() => {
  return orderItems.value.reduce((total, item) => total + item.price, 0)
})

// Submit order
const submitOrder = async () => {
  try {
    const orderRef = dbRef(db, 'orders')
    await push(orderRef, {
      ...orderData.value,
      items: orderItems.value,
      totalPrice: totalPrice.value,
      createdAt: new Date().toISOString()
    })
    
    // Reset form
    orderData.value = {
      customerName: '',
      customerPhone: '',
      customerAddress: '',
      deliveryDate: '',
    }
    orderItems.value = []
    alert('ההזמנה נשמרה בהצלחה!')
  } catch (error) {
    console.error('Error submitting order:', error)
    alert('שגיאה בשמירת ההזמנה')
  }
}

// Load items on component mount
loadItems()
</script>

<style scoped>
.remove-button {
  background: #e74c3c;
  width: auto;
  padding: 0.5rem;
}

.remove-button:hover {
  background: #c0392b;
}
</style> 