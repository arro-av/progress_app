import { ipcMain } from 'electron'
import db from '../db/lowdb.js'
import { IPC_CHANNELS } from '../channels'
import { Tag } from '../db/types'

import { getDates } from '../helpers/getDates.js'
const { getToday } = getDates()

import { normalizePositionAfterDeletion } from '../helpers/positionNormalizer.js'

export function registerTagHandlers() {
  ipcMain.handle(IPC_CHANNELS.GET_TAGS, () => db.data.tags)

  ipcMain.handle(IPC_CHANNELS.ADD_TAG, (event, addedTag: Tag) => {
    db.read()
    const nextId = (db.data.tags.at(-1)?.id || 0) + 1
    const nextPosition = db.data.tags.length

    if (!addedTag.title || addedTag.title.trim() === '')
      return { success: false, message: 'Title is required' }

    const newTag = {
      id: nextId,
      title: addedTag.title,
      level: 1,
      exp_current: 0,
      exp_needed: 10,
      time_spent: 0,
      created_at: getToday(),
      position: nextPosition,
    }
    db.data.tags.push(newTag)

    db.write()
    event.sender.send(IPC_CHANNELS.TAGS_UPDATED)
    return { success: true, message: 'Tag added' }
  })

  ipcMain.handle(IPC_CHANNELS.EDIT_TAG, (event, editedTag: Tag) => {
    db.read()
    const index = db.data.tags.findIndex((tag) => tag.id === editedTag.id)
    if (index === -1) return { success: false, message: 'Tag not found' }

    if (!editedTag.title || editedTag.title.trim() === '')
      return { success: false, message: 'Title is required' }

    const tagToUpdate = db.data.tags[index]
    tagToUpdate.title = editedTag.title

    db.write()
    event.sender.send(IPC_CHANNELS.TAGS_UPDATED)
    return { success: true, message: 'Tag updated' }
  })

  ipcMain.handle(IPC_CHANNELS.DELETE_TAG, (event, id: number) => {
    db.read()
    const index = db.data.tags.findIndex((tag) => tag.id === id)
    if (index === -1) return { success: false, message: 'Tag not found' }

    const tags = db.data.tags
    const tagToDelete = tags[index]

    tags.splice(index, 1)
    normalizePositionAfterDeletion(tags, tagToDelete.position)

    db.write()
    event.sender.send(IPC_CHANNELS.TAGS_UPDATED)
    return { success: true, message: 'Tag deleted!' }
  })
}
