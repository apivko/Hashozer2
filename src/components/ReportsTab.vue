<!-- ReportsTab.vue -->
<template>
  <div id="reports" class="tab-content">
    <div class="report-section">
      <div class="report-header">
        <h2>דוח שבועי</h2>
        <div class="button-group">
          <button @click="printReport" class="print-button">
            <i class="fas fa-print"></i>
          </button>
        </div>
      </div>
      
      <div id="reportOutput">
        <!-- Summary Section -->
        <div class="report-summary">
          <h3>סיכום שבועי</h3>
          <div class="summary-grid">
            <div class="summary-item">
              <span>הזמנות</span>
              <strong>{{ weeklyOrders.length }}</strong>
            </div>
            <div class="summary-item">
              <span>הכנסות</span>
              <strong>₪{{ totalOrdersRevenue }}</strong>
            </div>
            <div class="summary-item">
              <span>הוצאות</span>
              <strong>₪{{ totalExpenses }}</strong>
            </div>
            <div class="summary-item profit">
              <span>רווח נקי</span>
              <strong>₪{{ netProfit }}</strong>
            </div>
          </div>
        </div>

        <!-- Orders List -->
        <div class="orders-list">
          <h3>הזמנות</h3>
          <div v-for="order in weeklyOrders" :key="order.id" class="order-item">
            <div class="order-header">  
              <h4>{{ order.customerName }}</h4>
              <span>{{ formatDate(order.createdAt) }}</span>
            </div>
            <div class="order-total">₪{{ order.totalPrice }}</div>
          </div>
        </div>

        <!-- Expenses List -->
        <div class="expenses-list">
          <h3>הוצאות</h3>
          <div v-for="expense in weeklyExpenses" :key="expense.id" class="expense-item">
            <span>{{ expense.name }}</span>
            <span>₪{{ expense.amount }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getDatabase, ref as dbRef, query, orderByChild, startAt, get } from 'firebase/database'

const db = getDatabase()

// State
const weeklyOrders = ref([])
const weeklyExpenses = ref([])

// Get start of week
const getStartOfWeek = () => {
  const date = new Date()
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  const startOfWeek = new Date(date.setDate(diff))
  startOfWeek.setHours(0, 0, 0, 0)
  return startOfWeek.toISOString()
}

// Format date
const formatDate = (dateString) => {
  return new Intl.DateTimeFormat('he-IL', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  }).format(new Date(dateString))
}

// Load data
const loadWeeklyData = async () => {
  const startOfWeek = getStartOfWeek()
  
  try {
    // Load orders
    const ordersSnap = await get(
      query(dbRef(db, 'orders'), orderByChild('createdAt'), startAt(startOfWeek))
    )
    if (ordersSnap.exists()) {
      weeklyOrders.value = Object.entries(ordersSnap.val())
        .map(([id, data]) => ({ id, ...data }))
    }
    
    // Load expenses
    const expensesSnap = await get(
      query(dbRef(db, 'expenses'), orderByChild('createdAt'), startAt(startOfWeek))
    )
    if (expensesSnap.exists()) {
      weeklyExpenses.value = Object.entries(expensesSnap.val())
        .map(([id, data]) => ({ id, ...data }))
    }
  } catch (error) {
    console.error('Error loading data:', error)
  }
}

// Computed values
const totalOrdersRevenue = computed(() => 
  weeklyOrders.value.reduce((sum, order) => sum + order.totalPrice, 0)
)

const totalExpenses = computed(() => 
  weeklyExpenses.value.reduce((sum, expense) => sum + expense.amount, 0)
)

const netProfit = computed(() => totalOrdersRevenue.value - totalExpenses.value)

// Print report
const printReport = () => window.print()

// Initialize
onMounted(loadWeeklyData)
</script>

<style scoped>
.report-section {
  background: white;
  padding: 2rem;
  border-radius: 0.75rem;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 1rem 0 2rem;
}

.summary-item {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 0.5rem;
  text-align: center;
}

.summary-item.profit strong {
  color: #27ae60;
}

.summary-item span {
  display: block;
  margin-bottom: 0.5rem;
  color: #666;
}

.summary-item strong {
  font-size: 1.25rem;
}

.order-item, .expense-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  margin-bottom: 0.5rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
}

.order-header h4 {
  margin: 0;
}

.orders-list, .expenses-list {
  margin-top: 2rem;
}

@media print {
  .button-group {
    display: none;
  }
  
  .report-section {
    box-shadow: none;
    padding: 0;
  }
}
</style> 