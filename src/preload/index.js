import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { IPC_CHANNELS } from '../main/channels'

// exposes custom API to renderer process
const api = {
  // Custom window control panel
  windowControl: (action) => ipcRenderer.send('window-control', action),

  // Universal Function
  moveItem: (item, itemType, direction) =>
    ipcRenderer.invoke(IPC_CHANNELS.MOVE_ITEM, item, itemType, direction),

  // User Functions
  getUser: async () => await ipcRenderer.invoke(IPC_CHANNELS.GET_USER),
  onUserUpdate: (callback) => {
    const handler = () => callback()
    ipcRenderer.on(IPC_CHANNELS.USER_UPDATED, handler)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.USER_UPDATED, handler)
  },

  // Timer Functions
  addTime: async (timeSpent, todoListId) =>
    await ipcRenderer.invoke(IPC_CHANNELS.ADD_TIME, timeSpent, todoListId),
  startTimer: async () => await ipcRenderer.invoke(IPC_CHANNELS.TIMER_START),
  stopTimer: async () => await ipcRenderer.invoke(IPC_CHANNELS.TIMER_STOP),
  resetTimer: async () => await ipcRenderer.invoke(IPC_CHANNELS.TIMER_RESET),
  setTimerDuration: async (minutes) =>
    await ipcRenderer.invoke(IPC_CHANNELS.TIMER_SET_DURATION, minutes),
  getTimerState: async () => await ipcRenderer.invoke(IPC_CHANNELS.TIMER_GET_STATE),
  onTimerUpdate: (callback) => {
    const handler = (event, data) => callback(data)
    ipcRenderer.on(IPC_CHANNELS.TIMER_UPDATE, handler)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.TIMER_UPDATE, handler)
  },
  onTimerComplete: (callback) => {
    const handler = () => callback()
    ipcRenderer.on(IPC_CHANNELS.TIMER_COMPLETE, handler)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.TIMER_COMPLETE, handler)
  },

  // Questline Functions
  getQuestlines: async () => await ipcRenderer.invoke(IPC_CHANNELS.GET_QUESTLINES),
  addQuestline: async (project) => await ipcRenderer.invoke(IPC_CHANNELS.ADD_QUESTLINE, project),
  deleteQuestline: async (id) => await ipcRenderer.invoke(IPC_CHANNELS.DELETE_QUESTLINE, id),
  editQuestline: async (project) => await ipcRenderer.invoke(IPC_CHANNELS.EDIT_QUESTLINE, project),
  claimQuestlineReward: async (project) =>
    await ipcRenderer.invoke(IPC_CHANNELS.CLAIM_QUESTLINE_REWARD, project),
  cancelQuestline: async (project) => await ipcRenderer.invoke(IPC_CHANNELS.CANCEL_QUESTLINE, project),
  activateQuestline: async (project) =>
    await ipcRenderer.invoke(IPC_CHANNELS.ACTIVATE_QUESTLINE, project),
  onQuestlinesUpdate: (callback) => {
    const handler = () => callback()
    ipcRenderer.on(IPC_CHANNELS.QUESTLINES_UPDATED, handler)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.QUESTLINES_UPDATED, handler)
  },

  // Quest Functions
  getQuests: async () => await ipcRenderer.invoke(IPC_CHANNELS.GET_QUESTS),
  addQuest: async (quest) => await ipcRenderer.invoke(IPC_CHANNELS.ADD_QUEST, quest),
  editQuest: async (quest) => await ipcRenderer.invoke(IPC_CHANNELS.EDIT_QUEST, quest),
  deleteQuest: async (id) => await ipcRenderer.invoke(IPC_CHANNELS.DELETE_QUEST, id),
  activateQuest: async (quest) => await ipcRenderer.invoke(IPC_CHANNELS.ACTIVATE_QUEST, quest),
  claimQuestReward: async (quest) =>
    await ipcRenderer.invoke(IPC_CHANNELS.CLAIM_QUEST_REWARD, quest),
  onQuestsUpdate: (callback) => {
    const handler = () => callback()
    ipcRenderer.on(IPC_CHANNELS.QUESTS_UPDATED, handler)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.QUESTS_UPDATED, handler)
  },

  // Task Functions
  getTasks: async () => await ipcRenderer.invoke(IPC_CHANNELS.GET_TASKS),
  addTask: async (task) => await ipcRenderer.invoke(IPC_CHANNELS.ADD_TASK, task),
  editTask: async (task) => await ipcRenderer.invoke(IPC_CHANNELS.EDIT_TASK, task),
  deleteTask: async (id) => await ipcRenderer.invoke(IPC_CHANNELS.DELETE_TASK, id),
  toggleTaskCompletion: async (taskId) =>
    await ipcRenderer.invoke(IPC_CHANNELS.TOGGLE_TASK_COMPLETION, taskId),
  getNextActiveTask: async () => await ipcRenderer.invoke(IPC_CHANNELS.GET_NEXT_ACTIVE_TASK),
  onTasksUpdate: (callback) => {
    const handler = () => callback()
    ipcRenderer.on(IPC_CHANNELS.TASKS_UPDATED, handler)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.TASKS_UPDATED, handler)
  },

  // Idea Functions
  getIdeas: async () => await ipcRenderer.invoke(IPC_CHANNELS.GET_IDEAS),
  addIdea: async (idea) => await ipcRenderer.invoke(IPC_CHANNELS.ADD_IDEA, idea),
  editIdea: async (idea) => await ipcRenderer.invoke(IPC_CHANNELS.EDIT_IDEA, idea),
  deleteIdea: async (id) => await ipcRenderer.invoke(IPC_CHANNELS.DELETE_IDEA, id),
  convertIdeaToProject: async (id) =>
    await ipcRenderer.invoke(IPC_CHANNELS.CONVERT_IDEA_TO_PROJECT, id),
  onIdeasUpdate: (callback) => {
    const handler = () => callback()
    ipcRenderer.on(IPC_CHANNELS.IDEAS_UPDATED, handler)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.IDEAS_UPDATED, handler)
  },

  // Tag Functions
  getTags: async () => await ipcRenderer.invoke(IPC_CHANNELS.GET_TAGS),
  addTag: async (tag) => await ipcRenderer.invoke(IPC_CHANNELS.ADD_TAG, tag),
  editTag: async (tag) => await ipcRenderer.invoke(IPC_CHANNELS.EDIT_TAG, tag),
  deleteTag: async (id) => await ipcRenderer.invoke(IPC_CHANNELS.DELETE_TAG, id),
  onTagsUpdate: (callback) => {
    const handler = (event, newTags) => callback(newTags)
    ipcRenderer.on(IPC_CHANNELS.TAGS_UPDATED, handler)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.TAGS_UPDATED, handler)
  },

  // Reward Functions
  getRewards: async () => await ipcRenderer.invoke(IPC_CHANNELS.GET_REWARDS),
  addReward: async (reward) => await ipcRenderer.invoke(IPC_CHANNELS.ADD_REWARD, reward),
  editReward: async (reward) => await ipcRenderer.invoke(IPC_CHANNELS.EDIT_REWARD, reward),
  deleteReward: async (id) => await ipcRenderer.invoke(IPC_CHANNELS.DELETE_REWARD, id),
  unlockReward: async (id) => await ipcRenderer.invoke(IPC_CHANNELS.UNLOCK_REWARD, id),
  onRewardsUpdate: (callback) => {
    console.log('✅ [Preload] Setting up rewards update listener')
    const handler = () => {
      console.log('🔔 [Preload] Rewards update event received')
      callback()
    }
    ipcRenderer.on(IPC_CHANNELS.REWARDS_UPDATED, handler)
    return () => {
      console.log('🧹 [Preload] Cleaning up rewards update listener')
      ipcRenderer.removeListener(IPC_CHANNELS.REWARDS_UPDATED, handler)
    }
  },

  // HabitStack Functions
  getHabitStacks: async () => await ipcRenderer.invoke(IPC_CHANNELS.GET_HABIT_STACKS),
  addHabitStack: async (habitStack) =>
    await ipcRenderer.invoke(IPC_CHANNELS.ADD_HABIT_STACK, habitStack),
  editHabitStack: async (habitStack) =>
    await ipcRenderer.invoke(IPC_CHANNELS.EDIT_HABIT_STACK, habitStack),
  deleteHabitStack: async (id) => await ipcRenderer.invoke(IPC_CHANNELS.DELETE_HABIT_STACK, id),
  onHabitStacksUpdate: (callback) => {
    const handler = () => callback()
    ipcRenderer.on(IPC_CHANNELS.HABIT_STACKS_UPDATED, handler)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.HABIT_STACKS_UPDATED, handler)
  },

  // Habit Functions
  getHabits: async () => await ipcRenderer.invoke(IPC_CHANNELS.GET_HABITS),
  addHabit: async (habit) => await ipcRenderer.invoke(IPC_CHANNELS.ADD_HABIT, habit),
  editHabit: async (habit) => await ipcRenderer.invoke(IPC_CHANNELS.EDIT_HABIT, habit),
  deleteHabit: async (id) => await ipcRenderer.invoke(IPC_CHANNELS.DELETE_HABIT, id),
  toggleHabitCompletion: async (habitId) =>
    await ipcRenderer.invoke(IPC_CHANNELS.TOGGLE_HABIT_COMPLETION, habitId),
  updateAllStreaks: async () => await ipcRenderer.invoke(IPC_CHANNELS.UPDATE_ALL_STREAKS),
  onHabitsUpdate: (callback) => {
    const handler = () => callback()
    ipcRenderer.on(IPC_CHANNELS.HABITS_UPDATED, handler)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.HABITS_UPDATED, handler)
  },
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
