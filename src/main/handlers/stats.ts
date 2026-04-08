import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import { join } from 'path'
import { writeFile } from 'fs/promises'
import db from '../db/lowdb.js'
import { IPC_CHANNELS } from '../channels'

export function registerStatsHandlers() {
  ipcMain.handle(IPC_CHANNELS.GET_STATS_SNAPSHOT, () => ({
    user: db.data.user,
    tags: db.data.tags,
    years: db.data.years,
    questlines: db.data.questlines,
    questlines_done: db.data.questlines_done,
  }))

  ipcMain.handle(IPC_CHANNELS.EXPORT_STATS_PDF, async (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (!window) {
      return { success: false, message: 'Window not found' }
    }

    const defaultPath = join(
      app.getPath('documents'),
      `progress-statistics-${new Date().toISOString().slice(0, 10)}.pdf`,
    )

    const saveDialog = await dialog.showSaveDialog(window, {
      title: 'Export statistics as PDF',
      defaultPath,
      filters: [{ name: 'PDF', extensions: ['pdf'] }],
    })

    if (saveDialog.canceled || !saveDialog.filePath) {
      return { success: false, message: 'PDF export cancelled' }
    }

    try {
      const pdfBuffer = await window.webContents.printToPDF({
        landscape: true,
        printBackground: true,
        pageSize: 'A4',
        margins: {
          top: 0.35,
          bottom: 0.35,
          left: 0.35,
          right: 0.35,
        },
      })

      await writeFile(saveDialog.filePath, pdfBuffer)

      return { success: true, filePath: saveDialog.filePath }
    } catch (error) {
      console.error('Failed to export statistics PDF:', error)
      return { success: false, message: 'Failed to export PDF' }
    }
  })
}
