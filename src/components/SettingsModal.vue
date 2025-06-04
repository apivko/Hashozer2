<!-- SettingsModal.vue -->
<template>
  <div class="modal">
    <div class="modal-content">
      <span class="close" @click="$emit('close')">&times;</span>
      
      <div class="settings-tabs">
        <button 
          class="tab-button" 
          :class="{ active: currentTab === 'flowers' }"
          @click="currentTab = 'flowers'"
        >
          ניהול סוגי פרחים
        </button>
        <button 
          class="tab-button" 
          :class="{ active: currentTab === 'items' }"
          @click="currentTab = 'items'"
        >
          ניהול פריטים
        </button>
      </div>

      <!-- Flower Types Tab -->
      <div v-if="currentTab === 'flowers'" class="tab-content">
        <h2>ניהול סוגי פרחים</h2>
        
        <div class="flex-row">
          <input v-model="newFlower.name" placeholder="הוסף סוג פרח חדש" />
          <input v-model.number="newFlower.price" type="number" placeholder="מחיר ליחידה" />
          <button @click="addFlowerType">הוסף</button>
        </div>
        
        <table id="flowerTypeList">
          <thead>
            <tr>
              <th>סוג פרח</th>
              <th>מחיר ליחידה</th>
              <th>פעולות</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(price, name) in flowerTypes" :key="name">
              <td>{{ name }}</td>
              <td>₪{{ price }}</td>
              <td>
                <button @click="deleteFlowerType(name)" class="delete-button">
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Items Tab -->
      <div v-if="currentTab === 'items'" class="tab-content">
        <h2>ניהול פריטים</h2>
        
        <div class="flex-row">
          <input v-model="itemData.name" placeholder="שם מוצר (למשל: זר אהבה)" />
          <input v-model.number="itemData.price" type="number" placeholder="מחיר" />
        </div>
        <div class="flex-row">
          <input 
            v-model="selectedFlower"
            placeholder="בחר סוג פרח"
            list="flowers-list"
          />
          <input v-model.number="selectedQuantity" type="number" placeholder="כמות" />
          <button @click="addIngredient">הוסף פרח</button>
        </div>
        <datalist id="flowers-list">
          <option v-for="(price, name) in flowerTypes" :key="name" :value="name">
            {{ name }} - {{ price }}₪
          </option>
        </datalist>
        
        <ul id="ingredientsList">
          <li v-for="(ingredient, index) in itemData.ingredients" :key="index">
            {{ ingredient.name }} - {{ ingredient.quantity }} יחידות
            <button @click="removeIngredient(index)">
              <i class="fas fa-times"></i>
            </button>
          </li>
        </ul>
        <button @click="submitItem">שמור פריט</button>

        <div class="items-list">
          <h3>פריטים קיימים</h3>
          <div v-for="item in items" :key="item.id" class="item-entry">
            <div class="item-details">
              <h4>{{ item.name }}</h4>
              <p>מחיר: {{ item.price }}₪</p>
              <div class="ingredients-list">
                <p v-for="ing in item.ingredients" :key="ing.name">
                  {{ ing.name }}: {{ ing.quantity }} יחידות
                </p>
              </div>
            </div>
            <div class="item-actions">
              <button @click="deleteItem(item.id)" class="delete-button">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      <Toast v-if="toastMessage" :message="toastMessage" :type="toastType" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getDatabase, ref as dbRef, set, get, remove, push } from 'firebase/database'
import Toast from './Toast.vue'

const db = getDatabase()

// State
const currentTab = ref('flowers')
const flowerTypes = ref({})
const newFlower = ref({
  name: '',
  price: null
})

// Items state
const itemData = ref({
  name: '',
  price: null,
  ingredients: []
})
const selectedFlower = ref('')
const selectedQuantity = ref(null)
const items = ref([])

// Toast state
const toastMessage = ref('')
const toastType = ref('success')

// Load flower types
const loadFlowerTypes = async () => {
  try {
    const snapshot = await get(dbRef(db, 'flower_types'))
    if (snapshot.exists()) {
      flowerTypes.value = snapshot.val()
    }
  } catch (error) {
    console.error('Error loading flower types:', error)
  }
}

// Add new flower type
const addFlowerType = async () => {
  if (!newFlower.value.name || !newFlower.value.price) {
    toastMessage.value = 'נא למלא את כל השדות'
    toastType.value = 'error'
    return
  }

  try {
    await set(
      dbRef(db, `flower_types/${newFlower.value.name}`),
      newFlower.value.price
    )
    
    // Reset form
    newFlower.value = {
      name: '',
      price: null
    }
    
    // Reload flower types
    await loadFlowerTypes()
    toastMessage.value = 'סוג הפרח נוסף בהצלחה!'
    toastType.value = 'success'
  } catch (error) {
    console.error('Error adding flower type:', error)
    toastMessage.value = 'שגיאה בהוספת סוג פרח'
    toastType.value = 'error'
  }
}

// Delete flower type
const deleteFlowerType = async (name) => {
  if (!confirm('האם אתה בטוח שברצונך למחוק סוג פרח זה?')) {
    return
  }

  try {
    await remove(dbRef(db, `flower_types/${name}`))
    await loadFlowerTypes()
    toastMessage.value = 'סוג הפרח נמחק בהצלחה!'
    toastType.value = 'success'
  } catch (error) {
    console.error('Error deleting flower type:', error)
    toastMessage.value = 'שגיאה במחיקת סוג פרח'
    toastType.value = 'error'
  }
}

// Load items
const loadItems = async () => {
  try {
    const snapshot = await get(dbRef(db, 'flower_items'))
    if (snapshot.exists()) {
      items.value = Object.entries(snapshot.val()).map(([id, data]) => ({
        id,
        ...data
      }))
    }
  } catch (error) {
    console.error('Error loading items:', error)
  }
}

// Add ingredient to current item
const addIngredient = () => {
  if (selectedFlower.value && selectedQuantity.value > 0) {
    itemData.value.ingredients.push({
      name: selectedFlower.value,
      quantity: selectedQuantity.value
    })
    selectedFlower.value = ''
    selectedQuantity.value = null
  }
}

// Remove ingredient
const removeIngredient = (index) => {
  itemData.value.ingredients.splice(index, 1)
}

// Submit new item
const submitItem = async () => {
  if (!itemData.value.name || !itemData.value.price) {
    toastMessage.value = 'נא למלא את כל השדות'
    toastType.value = 'error'
    return
  }

  try {
    const itemsRef = dbRef(db, 'flower_items')
    await push(itemsRef, itemData.value)
    
    // Reset form
    itemData.value = {
      name: '',
      price: null,
      ingredients: []
    }
    
    // Reload items
    await loadItems()
    toastMessage.value = 'הפריט נשמר בהצלחה!'
    toastType.value = 'success'
  } catch (error) {
    console.error('Error saving item:', error)
    toastMessage.value = 'שגיאה בשמירת הפריט'
    toastType.value = 'error'
  }
}

// Delete item
const deleteItem = async (itemId) => {
  if (!confirm('האם אתה בטוח שברצונך למחוק פריט זה?')) {
    return
  }

  try {
    await remove(dbRef(db, `flower_items/${itemId}`))
    await loadItems()
    toastMessage.value = 'הפריט נמחק בהצלחה!'
    toastType.value = 'success'
  } catch (error) {
    console.error('Error deleting item:', error)
    toastMessage.value = 'שגיאה במחיקת הפריט'
    toastType.value = 'error'
  }
}

// Initialize
onMounted(() => {
  loadFlowerTypes()
  loadItems()
})

// Define emits
defineEmits(['close'])
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 0.75rem;
  width: 90%;
  max-width: 800px;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
}

.close {
  position: absolute;
  right: 1rem;
  top: 1rem;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.settings-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #eee;
  padding-bottom: 1rem;
}

.tab-button {
  padding: 0.75rem 1.5rem;
  background: #f8f9fa;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  color: #666;
  transition: all 0.2s;
}

.tab-button.active {
  background: #2c3e50;
  color: white;
}

.tab-content {
  margin-top: 1rem;
}

table {
  width: 100%;
  margin-top: 2rem;
  border-collapse: collapse;
}

th, td {
  padding: 0.75rem;
  text-align: right;
  border-bottom: 1px solid #eee;
}

th {
  font-weight: bold;
  background: #f8f9fa;
}

.delete-button {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 0.25rem;
  cursor: pointer;
  width: auto;
}

.delete-button:hover {
  background: #c0392b;
}

/* Items tab specific styles */
.items-list {
  margin-top: 2rem;
}

.item-entry {
  background: #f8f9fa;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.item-details h4 {
  margin: 0 0 0.5rem 0;
}

.ingredients-list {
  margin-top: 0.5rem;
  font-size: 0.9rem;
}

.ingredients-list p {
  margin: 0.25rem 0;
}

#ingredientsList {
  list-style: none;
  padding: 0;
  margin: 1rem 0;
}

#ingredientsList li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  background: #f8f9fa;
  border-radius: 0.25rem;
}

#ingredientsList button {
  background: none;
  border: none;
  color: #e74c3c;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  width: auto;
}

#ingredientsList button:hover {
  color: #c0392b;
}
</style> 