import { defineStore } from 'pinia'
import { ref, toRaw } from 'vue'
import { useToasts } from '../helpers/composables/useToasts'
import { useDates } from '../../../shared/helpers/useDate.ts'
import { sortByPosition } from '../helpers/sortByPosition'

/**
 * QUESTS STORE
 * --------------------------------------------------------------------------------------------------------------
 * @var questlines {array} - Array of questlines
 * @function fetchQuestlines {function} - Fetches questlines from the database
 * @function addQuestline {function} - Adds a new questline to the database | {param} Questline object
 * @function editQuestline {function} - Updates an existing questline in the database | {param} Questline object
 * @function deleteQuestline {function} - Deletes a questline from the database | {param} Questline ID
 * @function activateQuestline {function} - Activates a questline | {param} Questline ID
 * @function claimQuestlineReward {function} - Claims a questline reward | {param} Questline ID
 * --------------------------------------------------------------------------------------------------------------
 * @var quests {array} - Array of quests
 * @function fetchQuests {function} - Fetches quests from the database
 * @function addQuest {function} - Adds a new quest to the database | {param} Quest object
 * @function editQuest {function} - Updates an existing quest in the database | {param} Quest object
 * @function deleteQuest {function} - Deletes a quest from the database & normalizes position | {param} Quest ID
 * @function claimQuestReward {function} - Claims a quest reward | {param} Quest ID
 * --------------------------------------------------------------------------------------------------------------
 * @var tasks {array} - Array of tasks
 * @function fetchTasks {function} - Fetches tasks from the database
 * @function addTask {function} - Adds a new task to the database | {param} Task object
 * @function editTask {function} - Updates an existing task in the database | {param} Task object
 * @function deleteTask {function} - Deletes a task from the database & normalizes position | {param} Task ID
 * @function toggleTaskCompletion {function} - Toggles the completion of a task
 * --------------------------------------------------------------------------------------------------------------
 * @function setupListeners {function} - Sets up listeners for questlines, quests & tasks update events
 * @function init {function} - Initializes the store by fetching data & setting up listeners
 * @function cleanupListeners {function} - Cleans up the listeners when a component unmounts
 */
export const useQuestsStore = defineStore('quests', () => {
  const { addToast } = useToasts()

  const questlines = ref([])
  const quests = ref([])
  const tasks = ref([])
  const loading = ref(false)
  const error = ref(null)

  let cleanupQuestlinesListener = null
  let cleanupQuestsListener = null
  let cleanupTasksListener = null

  const fetchQuestlines = async () => {
    loading.value = true
    try {
      questlines.value = await window.api.getQuestlines()
    } catch (err) {
      error.value = err
      console.error('Error fetching questlines:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchQuests = async () => {
    loading.value = true
    try {
      quests.value = await window.api.getQuests()
      quests.value = sortByPosition(quests.value)
    } catch (err) {
      error.value = err
      console.error('Error fetching quests:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchTasks = async () => {
    loading.value = true
    try {
      tasks.value = await window.api.getTasks()
      tasks.value = sortByPosition(tasks.value)
    } catch (err) {
      error.value = err
      console.error('Error fetching tasks:', err)
    } finally {
      loading.value = false
    }
  }

  // QUEST LINES
  const editQuestline = async (questline) => {
    return await window.api.editQuestline(questline)
  }

  const deleteQuestline = async (id) => {
    return await window.api.deleteQuestline(id)
  }

  const activateQuestline = async (questline) => {
    try {
      const result = await window.api.activateQuestline(questline)
      if (result.success) {
        addToast({ message: result.message, type: 'success' })
      } else {
        addToast({ message: result.message, type: 'error' })
      }
    } catch (error) {
      console.error('Error activating project:', error)
      addToast({ message: 'An error occured...', type: 'error' })
    }
  }

  const claimQuestlineReward = async (questline) => {
    try {
      const result = await window.api.claimQuestlineReward(questline)
      if (result.success) {
        addToast({ message: '+' + result.crystalsGained + ' Crystals', type: 'plusCrystals' })
        addToast({ message: '+' + result.userExpGained + ' EXP', type: 'plusExp' })
        if (result.levelUp) addToast({ message: 'Level Up!', type: 'lvlup' })
      } else {
        addToast({ message: result.message, type: 'error' })
      }
    } catch (error) {
      console.error('Error claiming todo list reward:', error)
      addToast({ message: 'An error occured...', type: 'error' })
    }
  }

  // QUESTS
  const addQuest = async (quest) => {
    return await window.api.addQuest(quest)
  }

  const editQuest = async (quest) => {
    return await window.api.editQuest(quest)
  }

  const deleteQuest = async (id) => {
    return await window.api.deleteQuest(id)
  }

  const claimQuestReward = async (quest) => {
    try {
      const result = await window.api.claimQuestReward(quest)
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
      console.error('Error claiming quest reward:', error)
      addToast({ message: 'An error occured...', type: 'error' })
    }
  }

  // TASKS
  const addTask = async (task) => {
    return await window.api.addTask(task)
  }

  const editTask = async (task) => {
    return await window.api.editTask(task)
  }

  const deleteTask = async (id) => {
    return await window.api.deleteTask(id)
  }

  const toggleTaskCompletion = async (task) => {
    try {
      await window.api.toggleTaskCompletion(toRaw(task))
    } catch (error) {
      console.error('Error toggling task completion:', error)
      addToast({ message: 'An error occured...', type: 'error' })
    }
  }

  const setupListeners = () => {
    if (cleanupQuestlinesListener) {
      cleanupQuestlinesListener()
    }
    cleanupQuestlinesListener = window.api.onQuestlinesUpdate(fetchQuestlines)

    if (cleanupQuestsListener) {
      cleanupQuestsListener()
    }
    cleanupQuestsListener = window.api.onQuestsUpdate(fetchQuests)

    if (cleanupTasksListener) {
      cleanupTasksListener()
    }
    cleanupTasksListener = window.api.onTasksUpdate(fetchTasks)
  }

  const cleanupListeners = () => {
    if (cleanupQuestlinesListener) {
      cleanupQuestlinesListener()
      cleanupQuestlinesListener = null
    }
    if (cleanupQuestsListener) {
      cleanupQuestsListener()
      cleanupQuestsListener = null
    }
    if (cleanupTasksListener) {
      cleanupTasksListener()
      cleanupTasksListener = null
    }
  }

  const init = async () => {
    await fetchQuestlines()
    await fetchQuests()
    await fetchTasks()
    setupListeners()
  }

  return {
    questlines,
    quests,
    tasks,
    loading,
    error,
    fetchQuestlines,
    fetchQuests,
    fetchTasks,

    init,
    cleanupListeners,

    editQuestline,
    deleteQuestline,
    activateQuestline,
    claimQuestlineReward,
    claimQuestReward,

    addQuest,
    editQuest,
    deleteQuest,

    addTask,
    editTask,
    deleteTask,
    toggleTaskCompletion,
  }
})
