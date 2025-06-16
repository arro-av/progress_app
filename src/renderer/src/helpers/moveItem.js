import { useToasts } from './composables/useToasts'
const { addToast } = useToasts()

/**
 * @function moveItem - Calls the moveItem function from the main process
 * @param {Object} item - The item to move.
 * @param {string} itemType - The type of the item (e.g., 'habit', 'quest', 'task').
 * @param {string} direction - The direction to move the item ('up' or 'down').
 */
export const moveItem = async (item, itemType, direction) => {
  try {
    const result = await window.api.moveItem(item, itemType, direction)
    if (!result.success) {
      addToast({ message: result.message, type: 'error' })
    }
  } catch (error) {
    console.error('Error moving item:', error)
    addToast({ message: 'An error occured...', type: 'error' })
  }
}
