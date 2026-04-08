import { ipcMain, BrowserWindow, Notification } from 'electron'
import db from '../db/lowdb.js'
import { IPC_CHANNELS } from '../channels'

import { useTimer } from '../services/useTimer'
const { addTime } = useTimer()

let timerInterval: NodeJS.Timeout | null
let timeLeft = 0
let timerDuration = 0
let isRunning = false
let startedAt: number | null = null
let endsAt: number | null = null

const getTimerLimits = () => {
  const settings = db.data.settings
  return {
    min: settings.timer_min,
    max: settings.timer_max,
    defaultSession: settings.timer_default_session,
  }
}

export const applyTimerSettings = (resetToDefault = false) => {
  const { min, max, defaultSession } = getTimerLimits()
  const clampedDefault = Math.max(min, Math.min(max, defaultSession))

  if (!isRunning) {
    const currentMinutes = Math.floor(timerDuration / 60) || clampedDefault
    const nextMinutes = resetToDefault
      ? clampedDefault
      : Math.max(min, Math.min(max, currentMinutes))

    timerDuration = nextMinutes * 60
    timeLeft = timerDuration
    return
  }

  const clampedDuration = Math.max(min * 60, Math.min(max * 60, timerDuration))
  timerDuration = clampedDuration
  timeLeft = Math.min(timeLeft, timerDuration)
}

const ensureTimerDefaults = () => {
  if (timerDuration > 0) return

  const { defaultSession } = getTimerLimits()
  timerDuration = defaultSession * 60
  timeLeft = timerDuration
}

const emitDataUpdates = (sender) => {
  sender.send(IPC_CHANNELS.USER_UPDATED)
  sender.send(IPC_CHANNELS.QUESTLINES_UPDATED)
  sender.send(IPC_CHANNELS.QUESTS_UPDATED)
  sender.send(IPC_CHANNELS.TAGS_UPDATED)
}

const clearTimerInterval = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

const getElapsedMinutes = () => {
  if (!startedAt) return 0
  return Math.max(0, (Date.now() - startedAt) / 1000 / 60)
}

const finalizeTrackedTime = (event, timeSpentMinutes: number) => {
  const result = addTime(
    timeSpentMinutes,
    db.data.user,
    db.data.years,
    db.data.questlines,
    db.data.quests,
    db.data.tags,
  )

  if (!result.success) {
    return { success: false, message: result.message ?? 'Failed to add time' }
  }

  db.data.user = result.updatedUser
  db.data.years = result.updatedYears
  db.data.questlines = result.updatedQuestlines
  db.data.quests = result.updatedQuests
  db.data.tags = result.updatedTags
  db.write()

  emitDataUpdates(event.sender)

  return {
    success: true,
    levelUp: result.levelUp,
    tagLevelUps: result.tagLevelUps,
    userExp: result.userExp,
    tagExp: result.tagExp,
    minutesAdded: Math.floor(timeSpentMinutes),
    message: result.message ?? 'Time added',
  }
}

export function registerTimerHandlers() {
  ensureTimerDefaults()

  ipcMain.handle(IPC_CHANNELS.ADD_TIME, (event, timeSpentMinutes: number) => {
    applyTimerSettings()
    ensureTimerDefaults()
    return finalizeTrackedTime(event, timeSpentMinutes)
  })

  ipcMain.handle(IPC_CHANNELS.TIMER_START, async (event) => {
    applyTimerSettings()
    ensureTimerDefaults()
    if (isRunning) return { success: false, message: 'Timer already running' }

    isRunning = true
    timeLeft = timerDuration
    startedAt = Date.now()
    endsAt = startedAt + timerDuration * 1000

    const window = BrowserWindow.fromWebContents(event.sender)
    if (!window) {
      isRunning = false
      startedAt = null
      endsAt = null
      return { success: false, message: 'Window not found' }
    }

    clearTimerInterval()

    timerInterval = setInterval(() => {
      if (!endsAt) return

      timeLeft = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000))
      event.sender.send(IPC_CHANNELS.TIMER_UPDATE, { timeLeft })

      if (timeLeft <= 0) {
        clearTimerInterval()
        isRunning = false
        startedAt = null
        endsAt = null

        try {
          event.sender.send(IPC_CHANNELS.TIMER_COMPLETE)
          const timeSpentMinutes = timerDuration / 60
          finalizeTrackedTime(event, timeSpentMinutes)

          if (Notification.isSupported()) {
            new Notification({
              title: 'Progress Timer',
              body: 'Your timer has finished.',
            }).show()
          }
        } catch (error) {
          console.error('Failed to handle timer completion:', error)
        }
      }
    }, 1000)

    return {
      success: true,
    }
  })

  ipcMain.handle(IPC_CHANNELS.TIMER_STOP, (event) => {
    applyTimerSettings()
    ensureTimerDefaults()

    if (!isRunning) {
      return { success: false, message: 'Timer is not running' }
    }

    const elapsedMinutes = getElapsedMinutes()

    clearTimerInterval()
    isRunning = false
    startedAt = null
    endsAt = null
    timeLeft = timerDuration

    return finalizeTrackedTime(event, elapsedMinutes)
  })

  ipcMain.handle(IPC_CHANNELS.TIMER_RESET, () => {
    applyTimerSettings(true)
    ensureTimerDefaults()
    clearTimerInterval()
    isRunning = false
    startedAt = null
    endsAt = null
    timeLeft = timerDuration
    return { success: true, message: 'Timer reset' }
  })

  ipcMain.handle(IPC_CHANNELS.TIMER_SET_DURATION, (event, duration: number) => {
    applyTimerSettings()
    ensureTimerDefaults()
    const { min, max } = getTimerLimits()
    const newDuration = Math.max(min, Math.min(max, duration))
    timerDuration = newDuration * 60
    if (!isRunning) {
      timeLeft = timerDuration
    }
    return { success: true, duration: timerDuration }
  })

  ipcMain.handle(IPC_CHANNELS.TIMER_GET_STATE, () => {
    applyTimerSettings()
    ensureTimerDefaults()
    const { min, max, defaultSession } = getTimerLimits()

    if (isRunning && endsAt) {
      timeLeft = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000))
    }

    return {
      isRunning,
      timeLeft,
      duration: timerDuration,
      minDuration: min,
      maxDuration: max,
      defaultDuration: defaultSession,
      progress: (timeLeft / timerDuration) * 100,
    }
  })
}
