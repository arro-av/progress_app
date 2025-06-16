import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const user = ref({
    balance: 0,
    level: 0,
    exp_current: 0,
    exp_needed: 60,
    focused_time: 0,
    pomodoros: 0,
    questlines_done: 0,
    todos_done: 0,
    ideas_total: 0,
    habits_implemented: 0,
    rewards_unlocked: 0,
    exp_gained: 0,
    crystals_gained: 0,
    created_at: null,
  })
  const loading = ref(false)
  const error = ref(null)
  let cleanupListener = null

  const fetchUser = async () => {
    loading.value = true
    try {
      const userData = await window.api.getUser()
      Object.assign(user.value, userData)
    } catch (err) {
      error.value = err
      console.error('Error fetching user data:', err)
    } finally {
      loading.value = false
    }
  }

  const setupListeners = () => {
    // if cleanupListener is not null, execute the cleanup function - prevent multiple listeners
    if (cleanupListener) {
      cleanupListener()
    }
    cleanupListener = window.api.onUserUpdate(fetchUser) // cleanupListener holds the cleanup function
  }

  const cleanupListeners = () => {
    if (cleanupListener) {
      cleanupListener() // execute the cleanup function
      cleanupListener = null
    }
  }

  const init = async () => {
    await fetchUser()
    setupListeners()
  }

  return {
    user,
    loading,
    error,
    fetchUser,
    setupListeners,
    cleanupListeners,
    init,
  }
})
