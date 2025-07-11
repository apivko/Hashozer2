<!-- ExistingOrdersTab.vue -->
<template>
  <div class="existing-orders-tab">
    <h2>הזמנות קיימות</h2>
    <div v-show="isCalendarReady">
      <FullCalendar 
        :key="calendarKey"
        :options="calendarOptions"
        class="calendar-container"
      />
    </div>
    <div v-show="!isCalendarReady" class="loading">
      <div class="loading-spinner"></div>
    </div>
    <OrderDetailsModal 
      :orderDetails="selectedOrderDetails" 
      :isVisible="isModalVisible" 
      @close="isModalVisible = false" 
    />
    <Toast v-if="toastMessage" :message="toastMessage" :type="toastType" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import allLocales from '@fullcalendar/core/locales-all'
import { getDatabase, ref as dbRef, get } from 'firebase/database'
import OrderDetailsModal from './OrderDetailsModal.vue'
import Toast from './Toast.vue'

const isCalendarReady = ref(false)
const calendarKey = ref(0) // force re-render by changing this key

const db = getDatabase();

const isModalVisible = ref(false);
const selectedOrderDetails = ref({});

// Add reactive variable to track days with orders
const daysWithOrders = ref(new Set());

// Toast state
const toastMessage = ref('');
const toastType = ref('error');

const calendarOptions = ref({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: 'timeGridWeek',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'timeGridWeek'
  },
  firstDay: 0,
  slotMinTime: '07:00:00',
  slotMaxTime: '21:00:00',
  height: '100%',
  aspectRatio: 1.35,
  expandRows: true,
  stickyHeaderDates: true,
  nowIndicator: true,
  locales: allLocales,
  locale: 'he',
  direction: 'rtl',
  buttonText: {
    today: 'היום',
    week: 'שבוע'
  },
  handleWindowResize: true,
  eventDisplay: 'block',
  allDaySlot: false,
  events: [
    
  ],
  dayHeaderContent: function(arg) {
    // Remove the prefix "יום" from the day name
    const dayName = arg.text.replace(/^יום\s/, '');
    
    // Check if this day has orders
    const hasOrders = daysWithOrders.value.has(arg.date.toDateString());
    
    // Create indicator element if day has orders
    const indicator = hasOrders ? '<span class="day-indicator">●</span>' : '';
    
    // Return HTML with day name and indicator
    return {
      html: `${indicator}${dayName}`
    };
  },
  eventClick: function(info) {
    const order = calendarOptions.value.events.find(event => {
      const eventStart = new Date(event.start);
      const infoStart = new Date(info.event.startStr);
      return eventStart.getTime() === infoStart.getTime();
    });
    if (order) {
      selectedOrderDetails.value = order;
      isModalVisible.value = true;
    }
  },
  hiddenDays: [6]
})

// Function to load orders from Firebase and format them as events
const loadOrdersAsEvents = async () => {
  try {
    const ordersSnapshot = await get(dbRef(db, 'orders'));
    if (ordersSnapshot.exists()) {
      const orders = Object.entries(ordersSnapshot.val()).map(([id, order]) => {
        const start = new Date(order.deliveryDate);
        const end = new Date(start.getTime() + 30 * 60000); // 0.5 hour later
        const title = order.items.length > 0 ? order.items[0].name : 'No Title';
        return {
          id,
          title,
          start: start.toISOString(),
          end: end.toISOString(),
          // Include all order details for the modal
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          customerAddress: order.customerAddress,
          items: order.items,
          totalPrice: order.totalPrice,
          deliveryDate: order.deliveryDate,
          createdAt: order.createdAt
        };
      });
      calendarOptions.value.events = orders;
      
      // Populate daysWithOrders set
      daysWithOrders.value.clear();
      orders.forEach(order => {
        const orderDate = new Date(order.start);
        daysWithOrders.value.add(orderDate.toDateString());
      });
      
      // Force calendar refresh to update headers
      calendarKey.value++;
      
      // Update header styling after a short delay
      setTimeout(() => {
        // updateHeaderStyling(); // Removed as per edit hint
      }, 500);
    } 
  } catch (error) {
    console.error('Error loading orders:', error);
    toastMessage.value = 'משהו השתבש';
    toastType.value = 'error';
  }
};

function refreshCalendar() {
  calendarKey.value++
  setTimeout(() => {
    // Simulate click on the previous button
    const prevButton = document.querySelector('.fc-prev-button.fc-button.fc-button-primary');
    if (prevButton) prevButton.click();

    // Simulate click on the today button after a short delay
    setTimeout(() => {
      const todayButton = document.querySelector('.fc-today-button.fc-button.fc-button-primary');
      if (todayButton) todayButton.click();
      
      // Update header styling after navigation
      setTimeout(() => {
        // updateHeaderStyling(); // Removed as per edit hint
      }, 300);
            
    }, 500); // Adjust delay as needed
  }, 0); // Initial delay before clicking prev button
  setTimeout(() => {
        isCalendarReady.value = true;
      }, 3000);
}

onMounted(async () => {
  isCalendarReady.value = false
  try {
    console.log('Starting calendar initialization...')
    // Ensure calendar options are properly initialized
    if (!calendarOptions.value) {
      console.error('Calendar options are not properly initialized')
      return
    }
    
    // Log each plugin to verify they're loaded
    console.log('Plugins loaded:', {
      dayGrid: dayGridPlugin,
      timeGrid: timeGridPlugin,
      interaction: interactionPlugin
    })
    
    console.log('Calendar options:', calendarOptions.value)
    
    await loadOrdersAsEvents();

    // Set ready state after a brief delay to ensure DOM is ready
    setTimeout(() => {
      isCalendarReady.value = true
      console.log('Calendar ready state set to:', isCalendarReady.value)
      refreshCalendar()
      // Set table display property to 'table'
      const tables = document.querySelectorAll('table');
      tables.forEach(table => {
        table.style.setProperty('display', 'table', 'important');
      });
    }, 1000)

    
  } catch (error) {
    console.error('Error initializing calendar:', error)
    isCalendarReady.value = false
  }
})

console.log('Calendar options before rendering:', calendarOptions.value)
</script>

<style scoped>
.existing-orders-tab {
  padding: 20px;
  min-height: 300px;
  height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
  position: relative;
  margin: 0 auto;
  max-width: 100%;
  overflow-x: hidden;
}

.loading {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #666;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.calendar-container {
  margin-top: 20px;
  min-height: 500px;
  height: 100%;
  width: 100%;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;
}

:deep(.fc) {
  font-family: system-ui, -apple-system, sans-serif;
  flex: 1;
  height: 100% !important;
  direction: rtl;
  width: 100% !important;
}

:deep(.fc-button) {
  background-color: #4a5568 !important;
  border-color: #4a5568 !important;
}

:deep(.fc-button-active) {
  background-color: #2d3748 !important;
  border-color: #2d3748 !important;
}

:deep(.fc-timegrid-slot) {
  height: 50px !important;
}

:deep(.fc-col-header-cell) {
  background-color: #f7fafc;
  padding: 8px 0;
  margin: 0 !important;
}

:deep(.fc-timegrid-slots table) {
  display: table !important;
}

:deep(.fc-timegrid-axis) {
  background-color: #f7fafc;
}

:deep(.fc-timegrid-slot-label) {
  font-size: 0.875rem;
}

:deep(.fc-view-harness) {
  height: 100% !important;
}

/* Add mobile-specific styles */
@media screen and (max-width: 768px) {
  .existing-orders-tab {
    padding: 10px;
    height: 100%;
  }

  .calendar-container {
    padding: 10px;
    margin-top: 10px;
    min-height: 400px;
  }

  :deep(.fc) {
    min-height: 400px;
  }

  :deep(.fc-toolbar) {
    flex-direction: column;
    gap: 10px;
  }

  :deep(.fc-toolbar-title) {
    font-size: 1.2em !important;
  }

  :deep(.fc-timegrid-slot) {
    height: 40px !important;
  }

  :deep(.fc-timegrid-axis) {
    width: 45px !important;
  }

  :deep(.fc-timegrid-slot-label) {
    font-size: 0.75rem;
  }

  :deep(.fc-scrollgrid), :deep(.fc-scrollgrid-liquid) {
    display: table !important;
  }
}

.fc-direction-rtl .fc-toolbar > * > :not(:first-child) {
  margin-right: 0 !important;
}

:deep(.fc-header-toolbar) {
  flex-direction: row !important;
}

:deep(.fc-timeGridWeek-button.fc-button.fc-button-primary.fc-button-active) {
  display: none !important;
}

:deep(.fc-toolbar-chunk) {
  display: flex;
}

@keyframes spinner {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-spinner {
  border: 8px solid rgba(0, 0, 0, 0.1);
  border-left-color: #4a5568;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spinner 1s linear infinite;
  position: absolute;
  top: 40%;
  transform: translate(-50%, -50%);
}

:deep(.fc-scrollgrid), :deep(.fc-scrollgrid-liquid) {
  margin: 0 !important;
}

:deep(.fc-col-header) {
  margin: 0 !important;
}

/* Day indicator styles */
:deep(.day-indicator) {
  color: #3788d8;
  font-size: 1.2em;
  margin-right: 4px;
  display: inline-block;
  animation: pulse 2s infinite;
}

:deep(.fc-col-header-cell a) {
  display: flex;
  padding: 2px 4px;
  flex-direction: column-reverse;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}

@media (max-width: 600px) {
  table {
    display: table !important;
  }
}
</style> 