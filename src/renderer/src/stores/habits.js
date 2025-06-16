import { defineStore } from 'pinia'
import { ref, toRaw } from 'vue'
import { useToasts } from '../helpers/composables/useToasts'
import { useDates } from '../../../shared/helpers/useDate.ts'
import { sortByPosition } from '../helpers/sortByPosition'

/**
 * HABITS STORE
 * --------------------------------------------------------------------------------------------------------------
 * @var habits {array} - Array of habits
 * @var habitStacks {array} - Array of habit stacks
 * @function fetchHabits {function} - Fetches habits from the database
 * @function fetchHabitStacks {function} - Fetches habit stacks from the database
 * @function setupListeners {function} - Sets up listeners for habits & habit stacks update events
 * @function addHabit {function} - Adds a new habit to the database | {param} Habit object
 * @function editHabit {function} - Updates an existing habit in the database | {param} Habit object
 * @function deleteHabit {function} - Deletes a habit from the database & normalizes position | {param} Habit ID
 * @function toggleHabitCompletion {function} - Toggles the completion of a habit
 * @function updateAllStreaks {function} - Updates all habit-streaks in the database
 * @function addHabitStack {function} - Adds a new habit stack to the database | {param} HabitStack object
 * @function editHabitStack {function} - Updates an existing habit stack in the database | {param} HabitStack object
 * @function deleteHabitStack {function} - Deletes a habit stack from the database & normalizes position | {param} HabitStack ID
 * @function init {function} - Initializes the store by fetching data & setting up listeners
 * @function cleanupListeners {function} - Cleans up the listeners when a component unmounts
 */
export const useHabitsStore = defineStore('habits', () => {
  const { addToast } = useToasts()
  const { getToday } = useDates()

  const habits = ref([])
  const habitStacks = ref([])
  const loading = ref(false)
  const error = ref(null)

  let cleanupHabitsListener = null
  let cleanupHabitStacksListener = null

  const fetchHabits = async () => {
    loading.value = true
    try {
      habits.value = await window.api.getHabits()
      habits.value = sortByPosition(habits.value)
    } catch (err) {
      error.value = err
      console.error('Error fetching habits:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchHabitStacks = async () => {
    loading.value = true
    try {
      habitStacks.value = await window.api.getHabitStacks()
      habitStacks.value = sortByPosition(habitStacks.value)
    } catch (err) {
      error.value = err
      console.error('Error fetching habit stacks:', err)
    } finally {
      loading.value = false
    }
  }

  const setupListeners = () => {
    if (cleanupHabitsListener) {
      cleanupHabitsListener()
    }
    cleanupHabitsListener = window.api.onHabitsUpdate(fetchHabits)

    if (cleanupHabitStacksListener) {
      cleanupHabitStacksListener()
    }
    cleanupHabitStacksListener = window.api.onHabitStacksUpdate(fetchHabitStacks)
  }

  const cleanupListeners = () => {
    if (cleanupHabitsListener) {
      cleanupHabitsListener()
      cleanupHabitsListener = null
    }
    if (cleanupHabitStacksListener) {
      cleanupHabitStacksListener()
      cleanupHabitStacksListener = null
    }
  }

  const addHabit = async (habit) => {
    return await window.api.addHabit(habit)
  }

  const editHabit = async (habit) => {
    return await window.api.editHabit(habit)
  }

  const deleteHabit = async (id) => {
    return await window.api.deleteHabit(id)
  }

  const addHabitStack = async (habitStack) => {
    return await window.api.addHabitStack(habitStack)
  }

  const editHabitStack = async (habitStack) => {
    return await window.api.editHabitStack(habitStack)
  }

  const deleteHabitStack = async (id) => {
    return await window.api.deleteHabitStack(id)
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
    }
  }

  const init = async () => {
    await fetchHabits()
    await fetchHabitStacks()
    setupListeners()
    updateAllStreaks()
  }

  return {
    habits,
    habitStacks,
    loading,
    error,
    init,
    cleanupListeners,
    addHabit,
    editHabit,
    deleteHabit,
    addHabitStack,
    editHabitStack,
    deleteHabitStack,
    toggleHabitCompletion,
    updateAllStreaks,
  }
})
