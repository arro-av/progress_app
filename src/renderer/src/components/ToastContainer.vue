<script setup>
import Toast from './Toast.vue'
import { useToasts } from '../helpers/composables/useToasts' // Adjusted path

const { toasts, removeToast } = useToasts()
</script>

<template>
  <div class="toast-container">
    <transition-group
      name="toast-fade"
      tag="div"
    >
      <Toast
        v-for="toastItem in toasts"
        :key="toastItem.id"
        :message="toastItem.message"
        :type="toastItem.type"
        @close="removeToast(toastItem.id)"
      />
    </transition-group>
  </div>
</template>

<style scoped>
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.4s ease;
}

.toast-fade-move {
  transition: transform 0.4s ease;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
