import { BrowserWindow, dialog, ipcMain } from 'electron'
import { copyFile } from 'fs/promises'
import { join } from 'path'
import db from '../db/lowdb.js'
import { IPC_CHANNELS } from '../channels'
import defaultData from '../db/default'
import { dbFilePath } from '../db/lowdb'
import { applyTimerSettings } from './timer'

const broadcastSettingsUpdate = () => {
  BrowserWindow.getAllWindows().forEach((window) => {
    window.webContents.send(IPC_CHANNELS.SETTINGS_UPDATED)
  })
}

const sanitizeTimerValue = (value: number) => Math.floor(Number(value))

export function registerSettingHandlers() {
  ipcMain.handle(IPC_CHANNELS.GET_SETTINGS, () => db.data.settings)

  ipcMain.handle(
    IPC_CHANNELS.UPDATE_TIMER_SETTINGS,
    (_event, nextSettings: { timer_min: number; timer_max: number; timer_default_session: number }) => {
      db.read()

      const timerMin = sanitizeTimerValue(nextSettings?.timer_min)
      const timerMax = sanitizeTimerValue(nextSettings?.timer_max)
      const timerDefaultSession = sanitizeTimerValue(nextSettings?.timer_default_session)

      if (
        Number.isNaN(timerMin) ||
        Number.isNaN(timerMax) ||
        Number.isNaN(timerDefaultSession)
      ) {
        return { success: false, message: 'Timer settings must be valid numbers' }
      }

      if (timerMin < 2) {
        return { success: false, message: 'Minimum timer duration is 2 minutes' }
      }

      if (timerMax > 120) {
        return { success: false, message: 'Maximum timer duration is 120 minutes' }
      }

      if (timerMin > timerMax) {
        return { success: false, message: 'Minimum duration cannot be greater than maximum' }
      }

      if (timerDefaultSession < timerMin || timerDefaultSession > timerMax) {
        return { success: false, message: 'Default duration must be between minimum and maximum' }
      }

      db.data.settings = {
        ...db.data.settings,
        timer_min: timerMin,
        timer_max: timerMax,
        timer_default_session: timerDefaultSession,
      }

      applyTimerSettings(true)
      db.write()

      broadcastSettingsUpdate()

      return { success: true, message: 'Timer settings updated!' }
    },
  )

  ipcMain.handle(IPC_CHANNELS.RESET_TIMER_SETTINGS, () => {
    db.read()

    db.data.settings = {
      ...db.data.settings,
      timer_min: defaultData.settings.timer_min,
      timer_max: defaultData.settings.timer_max,
      timer_default_session: defaultData.settings.timer_default_session,
    }

    applyTimerSettings(true)
    db.write()

    broadcastSettingsUpdate()

    return { success: true, message: 'Timer settings reset to default!' }
  })

  ipcMain.handle(IPC_CHANNELS.EXPORT_DB_JSON, async () => {
    db.write()

    const [window] = BrowserWindow.getAllWindows()
    if (!window) {
      return { success: false, message: 'Window not found' }
    }

    const suggestedName = `progress-dev-db-backup-${new Date().toISOString().slice(0, 10)}.json`
    const saveDialog = await dialog.showSaveDialog(window, {
      title: 'Export database backup',
      defaultPath: join(dbFilePath, '..', suggestedName),
      filters: [{ name: 'JSON', extensions: ['json'] }],
    })

    if (saveDialog.canceled || !saveDialog.filePath) {
      return { success: false, message: 'Backup export cancelled' }
    }

    try {
      await copyFile(dbFilePath, saveDialog.filePath)
      return { success: true, message: 'Backup exported!' }
    } catch (error) {
      console.error('Failed to export database backup:', error)
      return { success: false, message: 'Failed to export backup' }
    }
  })
}
