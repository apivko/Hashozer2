<!-- App.vue -->
<template>
  <div id="splash-screen" v-if="showSplash" :class="{ 'fade-out': splashFading }">
    <img src="/logo.png" alt="השוזר">
    <h1>השוזר - ניהול</h1>
  </div>

  <LoginForm v-if="false" />

  <div class="container" v-if="true" :class="{ show: !showSplash }">
    <div class="header-container">
      <img src="/logo.png" alt="השוזר">
      <h1>ניהול הזמנות - השוזר</h1>
      <button id="settingsButton" class="settings-button" title="הגדרות" @click="toggleSettings">
        <i class="fas fa-cog"></i>
      </button>
    </div>

    <div class="tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        class="tab"
        :class="{ active: currentTab === tab.id }"
        @click="currentTab = tab.id"
      >
        {{ tab.name }}
      </button>
    </div>

    <div class="main-content">
      <!-- Orders Tab -->
      <OrdersTab v-if="currentTab === 'orders'" />
      
      <!-- Existing Orders Tab -->
      <ExistingOrdersTab v-if="currentTab === 'existing-orders'" />
      
      <!-- Expenses Tab -->
      <ExpensesTab v-if="currentTab === 'expenses'" />
      
      <!-- Reports Tab -->
      <ReportsTab v-if="currentTab === 'reports'" />
    </div>

    <footer>
      <p>© {{ new Date().getFullYear() }} השוזר - כל הזכויות שמורות</p>
    </footer>

    <!-- Settings Modal -->
    <SettingsModal 
      v-if="showSettings"
      @close="showSettings = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { getAuth } from 'firebase/auth'
import OrdersTab from './components/OrdersTab.vue'
import ExpensesTab from './components/ExpensesTab.vue'
import ReportsTab from './components/ReportsTab.vue'
import SettingsModal from './components/SettingsModal.vue'
import ExistingOrdersTab from './components/ExistingOrdersTab.vue'
import LoginForm from './components/LoginForm.vue'
import { onAuthStateChanged } from 'firebase/auth'

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC2zCq88ENRnWsScjVgp2INp7vtnR8ck0M",
  authDomain: "hashozerdb.firebaseapp.com",
  projectId: "hashozerdb",
  databaseURL: "https://hashozerdb-default-rtdb.europe-west1.firebasedatabase.app",
  storageBucket: "hashozerdb.firebasestorage.app",
  messagingSenderId: "159442413900",
  appId: "1:159442413900:web:f1fe5222ee2ce9de1e47e9"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getDatabase(app)
const auth = getAuth(app)

// State
const showSplash = ref(true)
const splashFading = ref(false)
const showSettings = ref(false)
const currentTab = ref('orders')
const isAuthenticated = ref(false)

const tabs = [
  { id: 'orders', name: 'הזמנות חדשות' },
  { id: 'existing-orders', name: 'הזמנות קיימות' },
  { id: 'expenses', name: 'הוצאות' },
  { id: 'reports', name: 'דוחות' }
]

// Methods
const toggleSettings = () => {
  showSettings.value = !showSettings.value
}

// Lifecycle
onMounted(() => {
  setTimeout(() => {
    splashFading.value = true
    setTimeout(() => {
      showSplash.value = false
    }, 500)
  }, 1500)
})

// Watch for authentication state changes
// onAuthStateChanged(auth, (user) => {
//   isAuthenticated.value = !!user
// })
</script>

<style>
@import './style.css';

/* Additional Vue-specific styles can be added here */
</style> 