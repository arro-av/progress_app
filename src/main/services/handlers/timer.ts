import { ipcMain, BrowserWindow } from 'electron'
import db from '../../db/lowdb.js'
import { IPC_CHANNELS } from '../channels'

let timerInterval: NodeJS.Timeout | null = null
let timeLeft = 0
let timerDuration = 25 * 60 // Default 25 minutes in seconds
let isRunning = false
let isCompleting = false

function notifyTimerUpdate(window: BrowserWindow) {
  window.webContents.send(IPC_CHANNELS.TIMER_UPDATE, { timeLeft })
}

function notifyTimerComplete(window: BrowserWindow) {
  window.webContents.send(IPC_CHANNELS.TIMER_COMPLETE)
}

// Extract the addTime logic to a separate function
async function addTimeToActiveQuestline(timeSpentMinutes: number) {
  db.read()
  const user = db.data.user
  const currentActiveQuestline = db.data.questlines.find((questline) => questline.active)
  if (!currentActiveQuestline) return { success: false, message: 'No active questline found' }

  const firstQuestInCurrentActiveQuestline = db.data.quests
    .filter((quest) => quest.questline_id === currentActiveQuestline.id)
    .sort((a, b) => a.position - b.position)[0]

  if (!firstQuestInCurrentActiveQuestline) {
    return { success: false, message: 'No quest found for active questline' }
  }

  const roundedTimeSpent = Math.round(timeSpentMinutes)

  user.pomodoros++
  user.focused_time += roundedTimeSpent
  currentActiveQuestline.time_spent += roundedTimeSpent
  firstQuestInCurrentActiveQuestline.time_spent += roundedTimeSpent

  db.write()
  return {
    success: true,
    user,
    questline: currentActiveQuestline,
    quest: firstQuestInCurrentActiveQuestline,
  }
}

export function registerTimerHandlers() {
  ipcMain.handle(IPC_CHANNELS.ADD_TIME, async (event, timeSpentMinutes: number) => {
    const result = await addTimeToActiveQuestline(timeSpentMinutes)
    if (result.success) {
      event.sender.send(IPC_CHANNELS.USER_UPDATED)
      event.sender.send(IPC_CHANNELS.QUESTLINES_UPDATED)
      event.sender.send(IPC_CHANNELS.QUESTS_UPDATED)
    }
    return result
  })

  ipcMain.handle(IPC_CHANNELS.TIMER_START, async (event) => {
    if (isRunning) return { success: false, message: 'Timer already running' }

    isRunning = true
    timeLeft = timeLeft || timerDuration

    const window = BrowserWindow.fromWebContents(event.sender)
    if (!window) return { success: false, message: 'Window not found' }

    timerInterval = setInterval(async () => {
      timeLeft--
      notifyTimerUpdate(window)

      if (timeLeft <= 0 && !isCompleting) {
        isCompleting = true
        clearInterval(timerInterval!)
        timerInterval = null
        isRunning = false

        // Add time when timer completes
        try {
          notifyTimerComplete(window)
          const timeSpentMinutes = timerDuration / 60
          const result = await addTimeToActiveQuestline(timeSpentMinutes)
          if (result.success && window && !window.isDestroyed()) {
            window.webContents.send(IPC_CHANNELS.USER_UPDATED)
            window.webContents.send(IPC_CHANNELS.QUESTLINES_UPDATED)
            window.webContents.send(IPC_CHANNELS.QUESTS_UPDATED)
          }
        } catch (error) {
          console.error('Failed to add time on timer completion:', error)
        }
      }
    }, 1000)

    return { success: true }
  })

  ipcMain.handle(IPC_CHANNELS.TIMER_STOP, () => {
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
    isRunning = false
    return { success: true }
  })

  ipcMain.handle(IPC_CHANNELS.TIMER_RESET, () => {
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
    isRunning = false
    timeLeft = timerDuration
    return { success: true }
  })

  ipcMain.handle(IPC_CHANNELS.TIMER_SET_DURATION, (event, duration: number) => {
    const newDuration = Math.max(1, Math.min(120, duration)) // Clamp between 1-120 minutes
    timerDuration = newDuration * 60 // Convert to seconds
    if (!isRunning) {
      timeLeft = timerDuration
    }
    return { success: true, duration: timerDuration }
  })

  ipcMain.handle(IPC_CHANNELS.TIMER_GET_STATE, () => {
    return {
      isRunning,
      timeLeft,
      duration: timerDuration,
      progress: (timeLeft / timerDuration) * 100,
    }
  })
}
