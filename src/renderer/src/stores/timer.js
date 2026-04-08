import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import { useToasts } from '../helpers/composables/useToasts'

/**
 * TIMER STORE
 * --------------------------------------------------------------------------------------------------------------
 * @var isRunning {boolean} - Whether the timer is currently running
 * @var timerDuration {number} - Duration of the timer in minutes
 * @var timeLeft {number} - Time left in seconds
 * @var progress {computed} - Progress percentage of the timer
 * @var formattedTime {computed} - Formatted time string (MM:SS)
 * @function startTimer {function} - Starts the timer
 * @function resetTimer {function} - Resets the timer
 * @function updateTimerDuration {function} - Updates the timer duration | {param} minutes {number}
 * @function manuallyAddTime {function} - Adds time to the timer | {param} minutes {number}
 * @function setupListeners {function} - Sets up timer event listeners
 * @function cleanupListeners {function} - Cleans up event listeners
 * @function init {function} - Initializes the store
 */
export const useTimerStore = defineStore('timer', () => {
  const { addToast } = useToasts()

  const isRunning = ref(false)
  const timerDuration = ref(25) // in minutes
  const timeLeft = ref(25 * 60) // in seconds
  let cleanupUpdate = null
  let cleanupComplete = null

  // Computed properties
  const formattedTime = computed(() => {
    const minutes = Math.floor(timeLeft.value / 60)
    const seconds = timeLeft.value % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  })

  const progress = computed(() => {
    return (timeLeft.value / (timerDuration.value * 60)) * 100
  })

  // Actions
  const startTimer = async () => {
    try {
      await window.api.startTimer()
      isRunning.value = true
      return true
    } catch (error) {
      console.error('Failed to start timer:', error)
      throw error
    }
  }

  const resetTimer = async () => {
    try {
      await window.api.resetTimer()
      isRunning.value = false
      timeLeft.value = timerDuration.value * 60
      return true
    } catch (error) {
      console.error('Failed to reset timer:', error)
      throw error
    }
  }

  const updateTimerDuration = (minutes) => {
    const newDuration = parseInt(minutes)
    timerDuration.value = newDuration
    window.api.setTimerDuration(newDuration)
    if (!isRunning.value) {
      timeLeft.value = newDuration * 60
    }
  }

  const manuallyAddTime = async (minutes) => {
    try {
      const result = await window.api.addTime(minutes)
      if (result.success) {
        addToast({ message: '+' + result.userExp + ' EXP', type: 'plusExp' })
        addToast({ message: '+' + result.tagExp + ' Tag-EXP', type: 'plusExp' })
        if (result.levelUp) addToast({ message: 'Level Up!', type: 'lvlup' })
        if (result.tagLevelUps?.length) {
          result.tagLevelUps.forEach((tagTitle) => {
            addToast({ message: `Level Up: ${tagTitle}`, type: 'lvlup' })
          })
        }
      }
    } catch (error) {
      console.error('Failed to add time:', error)
      throw error
    }
  }

  const setupListeners = () => {
    cleanupListeners()
    cleanupUpdate = window.api.onTimerUpdate((data) => {
      timeLeft.value = data.timeLeft
    })

    cleanupComplete = window.api.onTimerComplete(() => {
      isRunning.value = false
    })
  }

  const cleanupListeners = () => {
    if (cleanupUpdate) cleanupUpdate()
    if (cleanupComplete) cleanupComplete()
    cleanupUpdate = null
    cleanupComplete = null
  }

  // Initialize store
  const init = async () => {
    try {
      const state = await window.api.getTimerState()
      if (state) {
        isRunning.value = state.isRunning
        timeLeft.value = state.timeLeft || timerDuration.value * 60
        if (!isRunning.value) {
          timerDuration.value = Math.floor((state.duration || 25 * 60) / 60)
        }
      }
      setupListeners()
    } catch (error) {
      console.error('Failed to initialize timer store:', error)
    }
  }

  return {
    // State
    isRunning,
    timerDuration,
    timeLeft,

    // Computed
    formattedTime,
    progress,

    // Actions
    startTimer,
    resetTimer,
    updateTimerDuration,
    manuallyAddTime,

    // Lifecycle
    init,
    cleanupListeners,
  }
})
