<!-- OrdersTab.vue -->
<template>
  <div id="orders" class="tab-content active">
    <div class="item-form">
      <h2>הזמנה חדשה</h2>
      <div class="flex-row">
        <input 
          v-model="orderData.customerName" 
          @input="searchCustomers" 
          placeholder="שם הלקוח" 
          list="customers-list"
        />
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
      <datalist id="customers-list">
        <option 
          v-for="customer in filteredCustomers" 
          :key="customer.id" 
          :value="customer.name"
          @click="selectCustomer(customer)"
        >
          {{ customer.name }} - {{ customer.phone }}
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
    <Toast v-if="toastMessage" :message="toastMessage" :type="toastType" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getDatabase, ref as dbRef, push, get } from 'firebase/database'
import Toast from './Toast.vue'

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
const toastMessage = ref('')
const toastType = ref('success')

// Add a new ref to store customer data
const customers = ref([])
const filteredCustomers = ref([])

// Add a new ref to store orders data
const orders = ref([])

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

// Load customers from Firebase
const loadCustomers = async () => {
  try {
    const customersSnapshot = await get(dbRef(db, 'customers'))
    if (customersSnapshot.exists()) {
      customers.value = Object.entries(customersSnapshot.val()).map(([id, data]) => ({
        id,
        ...data
      }))
    }
  } catch (error) {
    console.error('Error loading customers:', error)
  }
}

// Load orders from Firebase
const loadOrders = async () => {
  try {
    const ordersSnapshot = await get(dbRef(db, 'orders'))
    if (ordersSnapshot.exists()) {
      orders.value = Object.entries(ordersSnapshot.val()).map(([id, data]) => ({
        id,
        ...data
      }))
    }
  } catch (error) {
    console.error('Error loading orders:', error)
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

// Search customers
const searchCustomers = () => {
  if (!orderData.value.customerName) {
    filteredCustomers.value = []
    return
  }
  
  const customerNameLower = orderData.value.customerName.toLowerCase()
  filteredCustomers.value = customers.value.filter(customer =>
    customer.name && customer.name.toLowerCase().includes(customerNameLower)
  )

  // Add orders-based suggestions
  const orderSuggestions = orders.value.filter(order =>
    order.customerName && order.customerName.toLowerCase().includes(customerNameLower)
  ).map(order => ({
    name: order.customerName,
    phone: order.customerPhone,
    address: order.customerAddress
  }))

  // Merge and deduplicate suggestions
  const allSuggestions = [...filteredCustomers.value, ...orderSuggestions]
  filteredCustomers.value = Array.from(new Set(allSuggestions.map(JSON.stringify))).map(JSON.parse)
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

// Add a method to validate phone number
const isValidPhoneNumber = (phone) => {
  const phonePattern = /^\d{10}$/; // Example pattern for a 10-digit phone number
  return phonePattern.test(phone);
}

// Auto-fill customer details
const selectCustomer = (customer) => {
  orderData.value.customerName = customer.name
  orderData.value.customerPhone = customer.phone
  orderData.value.customerAddress = customer.address
  filteredCustomers.value = []
}

// Modify the submitOrder function to use the Toast component
const submitOrder = async () => {
  if (!isValidPhoneNumber(orderData.value.customerPhone)) {
    toastMessage.value = 'מספר הטלפון אינו תקין. אנא הזן מספר טלפון תקין.';
    toastType.value = 'error';
    return;
  }
  
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
    toastMessage.value = 'ההזמנה נשמרה בהצלחה!'
    toastType.value = 'success'
  } catch (error) {
    console.error('Error submitting order:', error)
    toastMessage.value = 'שגיאה בשמירת ההזמנה'
    toastType.value = 'error'
  }
}

// Load items on component mount
loadItems()

// Load customers on component mount
loadCustomers()

// Load orders on component mount
loadOrders()
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