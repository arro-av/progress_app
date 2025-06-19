import { defineStore } from 'pinia'
import { useToasts } from '../helpers/composables/useToasts'
import { ref } from 'vue'
import { sortByPosition } from '../helpers/sortByPosition'

/**
 * REWARDS STORE
 * --------------------------------------------------------------------------------------------------------------
 * @var rewards {array} - Array of rewards
 * @function fetchRewards {function} - Fetches rewards from the database
 * @function addReward {function} - Adds a new reward to the database | {param} Reward object
 * @function editReward {function} - Updates an existing reward in the database | {param} Reward object
 * @function deleteReward {function} - Deletes a reward from the database & normalizes position | {param} Reward ID
 * @function unlockReward {function} - Unlocks a reward, updates the balance & deletes based on repeatable value | {param} Reward object
 * --------------------------------------------------------------------------------------------------------------
 */
export const useRewardsStore = defineStore('rewards', () => {
  const { addToast } = useToasts()
  const rewards = ref([])
  const loading = ref(false) // no noteable loading state -> keep for future
  const error = ref(null)
  let cleanupListener = null // To hold the cleanup function from the listener

  const fetchRewards = async () => {
    loading.value = true
    try {
      rewards.value = await window.api.getRewards()
      rewards.value = sortByPosition(rewards.value)
    } catch (err) {
      error.value = err
      console.error('Error fetching rewards:', err)
    } finally {
      loading.value = false
    }
  }

  // logic handled in useAdd.js
  const addReward = async (reward) => {
    return await window.api.addReward(reward)
  }

  // logic handled in useEdit.js
  const editReward = async (reward) => {
    return await window.api.editReward(reward)
  }

  // logic handled in useEdit.js
  const deleteReward = async (id) => {
    return await window.api.deleteReward(id)
  }

  const unlockReward = async (reward) => {
    try {
      const result = await window.api.unlockReward(reward)
      if (result.success) {
        addToast({ message: '-' + result.rewardCost + ' Crystals', type: 'minusCrystals' })
        addToast({ message: result.message, type: 'success' })
      } else {
        addToast({ message: result.message, type: 'error' })
      }
      return result
    } catch (error) {
      console.error('Error unlocking reward:', error)
      addToast({ message: 'An error occurred...', type: 'error' })
      throw error
    }
  }

  /**
   * --------------------------------------------------------------------------------------------------------------
   * @function setupListeners {function} - Sets up listeners for rewards update events
   * @function cleanupListeners {function} - Cleans up the listeners when a component unmounts
   * @function init {function} - Initializes the store by fetching rewards & setting up listeners
   * --------------------------------------------------------------------------------------------------------------
   */
  const setupListeners = () => {
    // if cleanupListener is not null, execute the cleanup function - prevent multiple listeners
    if (cleanupListener) {
      cleanupListener()
    }
    cleanupListener = window.api.onRewardsUpdate(fetchRewards) // listens to rewards update events
  }

  const cleanupListeners = () => {
    if (cleanupListener) {
      cleanupListener() // executes the returned removeListener function -> see preload/index.js
      cleanupListener = null
    }
  }

  const init = async () => {
    await fetchRewards()
    setupListeners()
  }

  return {
    rewards,
    loading,
    error,
    fetchRewards,
    addReward,
    editReward,
    deleteReward,
    unlockReward,
    init,
    cleanupListeners,
  }
})
