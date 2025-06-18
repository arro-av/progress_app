import { ipcMain } from 'electron'
import db from '../db/lowdb.js'
import { IPC_CHANNELS } from '../channels'

import { Tag } from '../db/types'
import { useTags } from '../services/useTags'
const { addTag, editTag, deleteTag } = useTags()

export function registerTagHandlers() {
  // GET TAGS ====================================================
  ipcMain.handle(IPC_CHANNELS.GET_TAGS, () => db.data.tags)

  // ADD TAG ====================================================
  ipcMain.handle(IPC_CHANNELS.ADD_TAG, (event, addedTag: Tag) => {
    db.read()

    const result = addTag(addedTag, db.data.tags)
    if (!result.titleValid) return { success: false, message: 'Title is required' }

    db.data.tags = result.updatedTags
    db.write()

    event.sender.send(IPC_CHANNELS.TAGS_UPDATED)
    return { success: true, message: 'Tag added' }
  })

  // EDIT TAG ====================================================
  ipcMain.handle(IPC_CHANNELS.EDIT_TAG, (event, editedTag: Tag) => {
    db.read()

    const result = editTag(editedTag, db.data.tags)
    if (!result.tagExists) return { success: false, message: 'Tag not found' }
    if (!result.titleValid) return { success: false, message: 'Title is required' }

    db.data.tags = result.updatedTags
    db.write()

    event.sender.send(IPC_CHANNELS.TAGS_UPDATED)
    return { success: true, message: 'Tag updated' }
  })

  // DELETE TAG ====================================================
  ipcMain.handle(IPC_CHANNELS.DELETE_TAG, (event, id: number) => {
    db.read()

    const result = deleteTag(id, db.data.tags)
    if (!result.tagExists) return { success: false, message: 'Tag not found' }

    db.data.tags = result.updatedTags
    db.write()

    event.sender.send(IPC_CHANNELS.TAGS_UPDATED)
    return { success: true, message: 'Tag deleted!' }
  })
}
