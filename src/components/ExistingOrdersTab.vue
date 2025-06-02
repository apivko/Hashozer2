<!-- ExistingOrdersTab.vue -->
<template>
  <div class="existing-orders-tab">
    <h2>הזמנות קיימות</h2>
    <div v-if="isCalendarReady">
      <FullCalendar 
        :options="calendarOptions"
        class="calendar-container"
      />
    </div>
    <div v-else class="loading">
      טוען לוח שנה...
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import allLocales from '@fullcalendar/core/locales-all'

const isCalendarReady = ref(false)

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
  height: 'auto',
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
  allDaySlot: false
})

onMounted(async () => {
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
    
    // Set ready state after a brief delay to ensure DOM is ready
    setTimeout(() => {
      isCalendarReady.value = true
      console.log('Calendar ready state set to:', isCalendarReady.value)
    }, 2000)
  } catch (error) {
    console.error('Error initializing calendar:', error)
    isCalendarReady.value = false
  }
})
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
    height: calc(100vh - 60px);
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
}
</style> 