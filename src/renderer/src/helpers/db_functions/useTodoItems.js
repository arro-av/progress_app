import { useToasts } from '../composables/useToasts'
import { useDates } from '../../../../shared/helpers/useDate.ts'
import { toRaw, ref } from 'vue'

const { addToast } = useToasts()
const { getToday } = useDates()
/**
 * TODO ITEMS RELATED COMPOSABLE
 * --------------------------------------------------------------------------------------------------------------
 * @function addTodoItem {function} - Adds a todo item to the database
 * @function editTodoItem {function} - Edits a todo item in the database
 * @function toggleTodoItemCompletion {function} - Toggles the completion of a todo item
 * @function onTodoItemsUpdate {function} - Listens for todo item updates from the database
 */
export function useTodoItems() {
  const nextActiveTodo = ref(null)
  const nextActiveTodoTitle = ref(null)

  const addTodoItem = async (todoItem) => {
    return await window.api.addTodoItem(todoItem)
  }

  const editTodoItem = async (todoItem) => {
    return await window.api.editTodoItem(todoItem)
  }

  const onTodoItemsUpdate = (callback) => {
    return window.api.onTodoItemsUpdate(callback)
  }

  const toggleTodoItemCompletion = async (todoItem) => {
    try {
      await window.api.toggleTodoItemCompletion(toRaw(todoItem))
    } catch (error) {
      console.error('Error toggling todo item completion:', error)
      addToast({ message: 'An error occured...', type: 'error' })
    }
  }

  const getNextActiveTodo = async () => {
    try {
      const result = await window.api.getNextActiveTodo()
      if (result.success) {
        nextActiveTodo.value = result.todo
        nextActiveTodoTitle.value = result.title
        return result.title
      } else {
        addToast({ message: result.message, type: 'info' })
        return null
      }
    } catch (error) {
      console.error('Error getting next active todo:', error)
      addToast({ message: 'An error occurred while fetching next todo', type: 'error' })
      return null
    }
  }

  return {
    addTodoItem,
    editTodoItem,
    toggleTodoItemCompletion,
    onTodoItemsUpdate,
    getNextActiveTodo,
    nextActiveTodoTitle,
  }
}
