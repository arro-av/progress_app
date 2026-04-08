import { defineStore } from 'pinia'
import { ref } from 'vue'

const createDefaultSnapshot = () => ({
  user: {
    balance: 0,
    level: 0,
    exp_current: 0,
    exp_needed: 60,
    focused_time: 0,
    pomodoros: 0,
    questlines_done: 0,
    todos_done: 0,
    rewards_unlocked: 0,
    exp_gained: 0,
    crystals_gained: 0,
    created_at: null,
  },
  tags: [],
  years: [],
  questlines: [],
  questlines_done: [],
})

export const useStatsStore = defineStore('stats', () => {
  const snapshot = ref(createDefaultSnapshot())
  const loading = ref(false)
  const error = ref(null)
  let cleanupListeners = []

  const fetchStatsSnapshot = async () => {
    loading.value = true

    try {
      snapshot.value = await window.api.getStatsSnapshot()
    } catch (err) {
      error.value = err
      console.error('Error fetching statistics snapshot:', err)
    } finally {
      loading.value = false
    }
  }

  const setupListeners = () => {
    if (cleanupListeners.length) {
      cleanupListeners.forEach((cleanup) => cleanup())
    }

    cleanupListeners = [
      window.api.onUserUpdate(fetchStatsSnapshot),
      window.api.onTagsUpdate(fetchStatsSnapshot),
      window.api.onQuestlinesUpdate(fetchStatsSnapshot),
    ]
  }

  const cleanup = () => {
    if (!cleanupListeners.length) return

    cleanupListeners.forEach((cleanup) => cleanup())
    cleanupListeners = []
  }

  const exportStatsPdf = async () => await window.api.exportStatsPdf()

  const init = async () => {
    await fetchStatsSnapshot()
    setupListeners()
  }

  return {
    snapshot,
    loading,
    error,
    fetchStatsSnapshot,
    exportStatsPdf,
    init,
    cleanup,
  }
})
