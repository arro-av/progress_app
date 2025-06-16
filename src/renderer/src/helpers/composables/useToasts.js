import { ref, readonly } from 'vue'

const toasts = ref([])
let toastIdCounter = 0

export function useToasts() {
  const addToast = ({ message, type = 'info', duration = 3000 }) => {
    const id = toastIdCounter++
    // Add to the beginning of the array so new toasts appear on top
    toasts.value.unshift({ id, message, type, duration })

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
    return id // Return ID if manual removal is ever needed
  }

  const removeToast = (id) => {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  return {
    // Expose toasts as readonly to encourage using addToast/removeToast
    toasts: readonly(toasts),
    addToast,
    removeToast,
  }
}