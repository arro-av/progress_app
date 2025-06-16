// src/renderer/src/helpers/composables/useEditMode.js
import { ref, watch } from 'vue'
import { useToasts } from './useToasts'

export function useEditEnable() {
  const editEnabled = ref(false)
  const { addToast } = useToasts()

  const toggleEditEnabled = () => {
    editEnabled.value = !editEnabled.value
  }

  watch(editEnabled, () => {
    if (!editEnabled.value) {
      addToast({
        message: 'Edit mode disabled',
        type: 'warning',
        duration: 2000,
      })
    } else {
      addToast({
        message: 'Edit mode enabled',
        type: 'success',
        duration: 2000,
      })
    }
  })

  return {
    editEnabled,
    toggleEditEnabled,
  }
}
