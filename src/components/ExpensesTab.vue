<!-- ExpensesTab.vue -->
<template>
  <div id="expenses" class="tab-content">
    <div class="item-form">
      <h2>הוצאה חדשה</h2>
      <div class="flex-row">
        <input v-model="expenseData.name" placeholder="שם ההוצאה" />
        <input v-model.number="expenseData.amount" type="number" placeholder="סכום" />
      </div>
      <button @click="submitExpense">הוסף הוצאה</button>
    </div>
    
    <div class="report-section">
      <h3>הוצאות השבוע</h3>
      <div id="expensesList">
        <div v-for="expense in weeklyExpenses" :key="expense.id" class="expense-item">
          <div class="expense-details">
            <span class="expense-name">{{ expense.name }}</span>
            <span class="expense-amount">{{ expense.amount }}₪</span>
            <span class="expense-date">{{ formatDate(expense.createdAt) }}</span>
          </div>
          <div class="expense-actions">
            <button @click="deleteExpense(expense.id)" class="delete-button">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        
        <div class="expenses-summary">
          סה"כ הוצאות השבוע: {{ totalWeeklyExpenses }}₪
        </div>
      </div>
    </div>
    <Toast v-if="toastMessage" :message="toastMessage" :type="toastType" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getDatabase, ref as dbRef, push, get, remove, query, orderByChild, startAt } from 'firebase/database'
import Toast from './Toast.vue'

const db = getDatabase()

// State
const expenseData = ref({
  name: '',
  amount: null
})

const expenses = ref([])
const toastMessage = ref('')
const toastType = ref('success')

// Get start of current week
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
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('he-IL', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  }).format(date)
}

// Load expenses
const loadExpenses = async () => {
  try {
    const startOfWeek = getStartOfWeek()
    const expensesRef = dbRef(db, 'expenses')
    const expensesQuery = query(
      expensesRef,
      orderByChild('createdAt'),
      startAt(startOfWeek)
    )
    
    const snapshot = await get(expensesQuery)
    if (snapshot.exists()) {
      expenses.value = Object.entries(snapshot.val()).map(([id, data]) => ({
        id,
        ...data
      }))
    } else {
      expenses.value = []
    }
  } catch (error) {
    console.error('Error loading expenses:', error)
  }
}

// Computed weekly expenses
const weeklyExpenses = computed(() => {
  return expenses.value.sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  )
})

// Computed total weekly expenses
const totalWeeklyExpenses = computed(() => {
  return weeklyExpenses.value.reduce((total, expense) => total + expense.amount, 0)
})

// Submit expense
const submitExpense = async () => {
  if (!expenseData.value.name || !expenseData.value.amount) {
    toastMessage.value = 'נא למלא את כל השדות'
    toastType.value = 'error'
    return
  }

  try {
    const expensesRef = dbRef(db, 'expenses')
    await push(expensesRef, {
      ...expenseData.value,
      createdAt: new Date().toISOString()
    })
    
    // Reset form
    expenseData.value = {
      name: '',
      amount: null
    }
    
    // Reload expenses
    await loadExpenses()
    toastMessage.value = 'ההוצאה נשמרה בהצלחה!'
    toastType.value = 'success'
  } catch (error) {
    console.error('Error saving expense:', error)
    toastMessage.value = 'שגיאה בשמירת ההוצאה'
    toastType.value = 'error'
  }
}

// Delete expense
const deleteExpense = async (expenseId) => {
  if (!confirm('האם אתה בטוח שברצונך למחוק הוצאה זו?')) {
    return
  }

  try {
    await remove(dbRef(db, `expenses/${expenseId}`))
    await loadExpenses()
    toastMessage.value = 'ההוצאה נמחקה בהצלחה!'
    toastType.value = 'success'
  } catch (error) {
    console.error('Error deleting expense:', error)
    toastMessage.value = 'שגיאה במחיקת ההוצאה'
    toastType.value = 'error'
  }
}

// Load data on component mount
onMounted(() => {
  loadExpenses()
})
</script>

<style scoped>
.expense-item {
  background: white;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.expense-details {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.expense-name {
  font-weight: bold;
  min-width: 150px;
}

.expense-amount {
  color: #e74c3c;
  font-weight: bold;
}

.expense-date {
  color: #666;
  font-size: 0.9rem;
}

.expenses-summary {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 2px solid #eee;
  font-weight: bold;
  font-size: 1.1rem;
}

.delete-button {
  background: #e74c3c;
  width: auto;
  padding: 0.5rem;
}

.delete-button:hover {
  background: #c0392b;
}
</style> 