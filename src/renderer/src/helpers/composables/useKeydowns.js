import { onMounted, onUnmounted } from 'vue'

/**
 * @function useKeydowns - Registers keydown events for saving, canceling, and deleting. Mounts & unmounts listeners.
 * @param {function} onSave - Pass a function to be called when Enter is pressed.
 * @param {function} onCancel - Pass a function to be called when Escape is pressed.
 * @param {function} onDelete - Pass a function to be called when Delete is pressed.
 * @param {function} onEdit - Pass a function to be called when E is pressed.
 */
export function useKeydowns({ onSave, onCancel, onDelete, onEdit }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') onSave?.()
    if (e.key === 'Escape') onCancel?.()
    if (e.key === 'Delete') onDelete?.()
    if (e.key === 'E' || e.key === 'e') onEdit?.()
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown)
  })
}
