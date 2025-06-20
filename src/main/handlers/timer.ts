import { ipcMain, BrowserWindow } from 'electron'
import db from '../db/lowdb.js'
import { IPC_CHANNELS } from '../channels'

import { useCaps } from '../../shared/constants/useCaps'
const { MAX_TIMER_DURATION, MIN_TIMER_DURATION } = useCaps()

import { useTimer } from '../services/useTimer'
const { addTime } = useTimer()

let timerInterval: NodeJS.Timeout | null
let timeLeft = 0
let timerDuration = 25 * 60
let isRunning = false

export function registerTimerHandlers() {
  ipcMain.handle(IPC_CHANNELS.ADD_TIME, (event, timeSpentMinutes: number) => {
    const result = addTime(timeSpentMinutes, db.data.user, db.data.questlines, db.data.quests)
    if (!result.success) return { success: false, message: 'Failed to add time' }
    db.data.user = result.updatedUser
    db.data.questlines = result.updatedQuestlines
    db.data.quests = result.updatedQuests
    db.write()

    event.sender.send(IPC_CHANNELS.USER_UPDATED)
    event.sender.send(IPC_CHANNELS.QUESTLINES_UPDATED)
    event.sender.send(IPC_CHANNELS.QUESTS_UPDATED)
    return result
  })

  ipcMain.handle(IPC_CHANNELS.TIMER_START, async (event) => {
    if (isRunning) return { success: false, message: 'Timer already running' }

    isRunning = true
    timeLeft = timerDuration

    const window = BrowserWindow.fromWebContents(event.sender)
    if (!window) {
      isRunning = false
      return { success: false, message: 'Window not found' }
    }

    console.log('Timer started!', timeLeft / 60)

    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }

    timerInterval = setInterval(() => {
      timeLeft--
      event.sender.send(IPC_CHANNELS.TIMER_UPDATE, { timeLeft })

      if (timeLeft <= 0) {
        if (timerInterval) {
          clearInterval(timerInterval)
          timerInterval = null
        }

        isRunning = false

        try {
          event.sender.send(IPC_CHANNELS.TIMER_COMPLETE)
          console.log('Timer completed!')
          const timeSpentMinutes = timerDuration / 60
          const result = addTime(timeSpentMinutes, db.data.user, db.data.questlines, db.data.quests)
          db.data.user = result.updatedUser
          db.data.questlines = result.updatedQuestlines
          db.data.quests = result.updatedQuests
          db.write()

          console.log('Timer completion handled successfully')
        } catch (error) {
          console.error('Failed to handle timer completion:', error)
        }
      }
    }, 1000)

    event.sender.send(IPC_CHANNELS.USER_UPDATED)
    event.sender.send(IPC_CHANNELS.QUESTLINES_UPDATED)
    event.sender.send(IPC_CHANNELS.QUESTS_UPDATED)
    return { success: true, message: 'Timer started' }
  })

  ipcMain.handle(IPC_CHANNELS.TIMER_RESET, () => {
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
    isRunning = false
    timeLeft = timerDuration
    return { success: true, message: 'Timer reset' }
  })

  ipcMain.handle(IPC_CHANNELS.TIMER_SET_DURATION, (event, duration: number) => {
    const newDuration = Math.max(MIN_TIMER_DURATION, Math.min(MAX_TIMER_DURATION, duration))
    timerDuration = newDuration * 60
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
