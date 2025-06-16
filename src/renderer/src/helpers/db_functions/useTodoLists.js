import { useToasts } from '../composables/useToasts'
const { addToast } = useToasts()

/**
 * TODO LISTS RELATED COMPOSABLE
 * --------------------------------------------------------------------------------------------------------------
 * @function addTodoList {function} - Adds a todo list to the database
 * @function editTodoList {function} - Edits a todo list in the database
 * @function onTodoListsUpdate {function} - Listens for todo list updates from the database
 */

export function useTodoLists() {
  const addTodoList = async (todoList) => {
    return await window.api.addTodoList(todoList)
  }

  const editTodoList = async (todoList) => {
    return await window.api.editTodoList(todoList)
  }

  const claimTodoListReward = async (todoList) => {
    try {
      const result = await window.api.claimTodoListReward(todoList)
      if (result.success) {
        addToast({ message: '+' + result.crystalsGained + ' Crystals', type: 'plusCrystals' })
        addToast({ message: '+' + result.userExpGained + ' EXP', type: 'plusExp' })
        addToast({ message: '+' + result.tagExpGained + ' Tag-EXP', type: 'plusExp' })
        if (result.levelUp) addToast({ message: 'Level Up!', type: 'lvlup' })
        if (result.tagLevelUp) addToast({ message: `Level Up: ${result.tagTitle}`, type: 'lvlup' })
      } else {
        addToast({ message: result.message, type: 'error' })
      }
    } catch (error) {
      console.error('Error claiming todo list reward:', error)
      addToast({ message: 'An error occured...', type: 'error' })
    }
  }

  const onTodoListsUpdate = (callback) => {
    return window.api.onTodoListsUpdate(callback)
  }

  return {
    addTodoList,
    editTodoList,
    claimTodoListReward,
    onTodoListsUpdate,
  }
}
