import { ipcMain } from 'electron'
import db from '../db/lowdb.js'
import { IPC_CHANNELS } from '../channels'

export function registerUserHandlers() {
  ipcMain.handle(IPC_CHANNELS.GET_USER, () => db.data.user)
}
