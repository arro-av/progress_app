import { ref, toRaw } from 'vue'

import { constructPayload } from '../constructPayload'

import { useToasts } from './useToasts'

/**
 * GENERIC ADD-ITEM COMPOSABLE
 * --------------------------------------------------------------------------------------------------------------
 * @var addedItemData {object} - The data of the item being added
 * @var isAdding {boolean} - Whether the adding state is active
 * @function startAdding - Activate adding state
 * @function cancelAdding - Deactivate adding state
 * @function saveAdding - Save added item
 * --------------------------------------------------------------------------------------------------------------
 * @param {object} config - Configuration object containing the following properties:
 * @param {function} config.addFn - Async function to add an item (e.g., (itemData) => addItem(itemData)).
 * @param {string} config.itemType - The type of item being added (e.g., 'reward', 'tag').
 */
export function useAdd({ addFn, itemType }) {
  const isAdding = ref(false)
  const addedItemData = ref({})
  const activeListId = ref(null)

  const { addToast } = useToasts()

  const startAdding = (listId = null) => {
    addedItemData.value = { ...constructPayload(itemType) }
    isAdding.value = true
    if (listId) activeListId.value = listId
  }

  const cancelAdding = () => {
    isAdding.value = false
    addedItemData.value = {}
    if (activeListId.value) activeListId.value = null
  }

  const saveAdding = async () => {
    try {
      const payload = toRaw(addedItemData.value)
      const result = await addFn(payload)
      if (result.success) {
        addToast({ message: result.message, type: 'success' })
      } else {
        addToast({ message: result.message, type: 'error' })
        return
      }
    } catch (error) {
      console.error('Error adding item:', error)
      addToast({ message: 'An error occured...', type: 'error' })
    }
    cancelAdding()
  }

  return {
    isAdding,
    addedItemData,
    activeListId,
    startAdding,
    cancelAdding,
    saveAdding,
  }
}
