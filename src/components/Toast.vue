<template>
  <div v-if="visible" :class="['toast', type]">
    {{ message }}
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  message: String,
  type: {
    type: String,
    default: 'success',
  },
  duration: {
    type: Number,
    default: 3000,
  },
});

const visible = ref(false);

watch(
  () => props.message,
  (newMessage) => {
    if (newMessage) {
      visible.value = true;
      setTimeout(() => {
        visible.value = false;
      }, props.duration);
    }
  }
);
</script>

<style scoped>
.toast {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  border-radius: 5px;
  color: white;
  font-weight: bold;
  z-index: 1000;
  transition: opacity 0.3s ease;
}

.toast.success {
  background-color: #4caf50;
}

.toast.error {
  background-color: #f44336;
}
</style> 