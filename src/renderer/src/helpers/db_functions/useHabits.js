import { useToasts } from '../composables/useToasts'
import { useDates } from '../../../../shared/helpers/useDate.ts'
import { toRaw } from 'vue'

const { addToast } = useToasts()
const { getToday } = useDates()
/**
 * HABITS RELATED COMPOSABLE
 * --------------------------------------------------------------------------------------------------------------
 * @function addHabit {function} - Adds a habit to the database
 * @function editHabit {function} - Edits a habit in the database
 * @function toggleHabitCompletion {function} - Toggles the completion of a habit
 * @function updateAllStreaks {function} - Updates all habit-streaks in the database
 * @function onHabitsUpdate {function} - Listens for habit updates from the database
 */
export function useHabits() {
  const addHabit = async (habit) => {
    return await window.api.addHabit(habit)
  }

  const editHabit = async (habit) => {
    return await window.api.editHabit(habit)
  }

  const onHabitsUpdate = (callback) => {
    return window.api.onHabitsUpdate(callback)
  }

  const toggleHabitCompletion = async (habit) => {
    const today = getToday()
    const lastTimeCompleted = habit.last_month_completed[habit.last_month_completed.length - 1]
    try {
      const result = await window.api.toggleHabitCompletion(toRaw(habit))
      if (result.success && lastTimeCompleted !== today) {
        addToast({ message: '+' + result.crystals + ' Crystals', type: 'plusCrystals' })
        addToast({ message: '+' + result.exp + ' EXP', type: 'plusExp' })
        if (result.levelUp) addToast({ message: 'Level Up!', type: 'lvlup' })
        if (result.tagLevelUp) addToast({ message: `Level Up: ${result.tagTitle}`, type: 'lvlup' })
      } else if (result.success && lastTimeCompleted === today) {
        const modifiedCrystals = result.crystals - 1
        const modifiedExp = result.exp - 1
        addToast({ message: '-' + modifiedCrystals + ' Crystals', type: 'minusCrystals' })
        addToast({ message: '-' + modifiedExp + ' EXP', type: 'minusExp' })
      } else {
        addToast({ message: result.message, type: 'error' })
      }
    } catch (error) {
      console.error('Error toggling habit completion:', error)
      addToast({ message: 'An error occured...', type: 'error' })
    }
  }

  const updateAllStreaks = async () => {
    try {
      await window.api.updateAllStreaks()
    } catch (error) {
      console.error('Error running daily streak update on backend:', error)
      return { success: false, message: 'Exception occurred during daily streak update.' }
    }
  }

  return {
    addHabit,
    editHabit,
    toggleHabitCompletion,
    updateAllStreaks,
    onHabitsUpdate,
  }
}
