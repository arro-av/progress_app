import { toRaw } from 'vue'
import { useToasts } from '../composables/useToasts'
const { addToast } = useToasts()

/**
 * UNIVERSALLY USED COMPOSABLE
 * --------------------------------------------------------------------------------------------------------------
 * @function getItems {function} - Gets all items of given type from the database
 * @function deleteItem {function} - Deletes an item from the database
 * @function moveItem {function} - Updates an item's position property
 */
export function useUniversals() {
  const getItems = async (itemType) => {
    return await window.api.getItems(itemType)
  }

  const deleteItem = async (index, itemType) => {
    return await window.api.deleteItem(index, itemType)
  }

  const moveItem = async (item, itemType, direction) => {
    try {
      const result = await window.api.moveItem(toRaw(item), itemType, direction)
      if (!result.success) {
        addToast({ message: result.message, type: 'error' })
      }
    } catch (error) {
      console.error('Error moving item:', error)
      addToast({ message: 'An error occured...', type: 'error' })
    }
  }

  return {
    getItems,
    deleteItem,
    moveItem,
  }
}
