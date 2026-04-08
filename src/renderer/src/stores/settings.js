import { defineStore } from 'pinia'
import { ref } from 'vue'

const createDefaultSettings = () => ({
  timer_min: 2,
  timer_max: 120,
  timer_default_session: 25,
})

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref(createDefaultSettings())
  const loading = ref(false)
  const error = ref(null)
  let cleanupListener = null

  const fetchSettings = async () => {
    loading.value = true

    try {
      settings.value = await window.api.getSettings()
    } catch (err) {
      error.value = err
      console.error('Error fetching settings:', err)
    } finally {
      loading.value = false
    }
  }

  const setupListeners = () => {
    if (cleanupListener) {
      cleanupListener()
    }

    cleanupListener = window.api.onSettingsUpdate(fetchSettings)
  }

  const cleanup = () => {
    if (!cleanupListener) return

    cleanupListener()
    cleanupListener = null
  }

  const updateTimerSettings = async (nextSettings) =>
    await window.api.updateTimerSettings(nextSettings)

  const resetTimerSettings = async () => await window.api.resetTimerSettings()

  const exportDbJson = async () => await window.api.exportDbJson()

  const init = async () => {
    await fetchSettings()
    setupListeners()
  }

  return {
    settings,
    loading,
    error,
    fetchSettings,
    updateTimerSettings,
    resetTimerSettings,
    exportDbJson,
    init,
    cleanup,
  }
})
