import { ipcMain } from 'electron'
import db from '../../db/lowdb.js'
import { IPC_CHANNELS } from '../channels'
import { Idea } from '../../db/types'

import { normalizePositionAfterDeletion } from '../../helpers/positionNormalizer.js'
import { getDates } from '../../helpers/getDates.js'
const { getToday } = getDates()

export function registerIdeaHandlers() {
  ipcMain.handle(IPC_CHANNELS.GET_IDEAS, () => db.data.ideas)

  ipcMain.handle(IPC_CHANNELS.ADD_IDEA, (event, addedIdea: Idea) => {
    db.read()
    const nextId = (db.data.ideas.at(-1)?.id || 0) + 1
    const nextPosition = db.data.ideas.length

    if (!addedIdea.title || addedIdea.title.trim() === '') {
      return {
        success: false,
        message: 'Title is required',
      }
    }
    if (!addedIdea.description || addedIdea.description.trim() === '') {
      return {
        success: false,
        message: 'Description is required',
      }
    }

    const newIdea = {
      id: nextId,
      title: addedIdea.title,
      description: addedIdea.description,
      position: nextPosition,
    }
    db.data.ideas.push(newIdea)

    db.data.user.ideas_total++

    db.write()
    event.sender.send(IPC_CHANNELS.IDEAS_UPDATED)
    return {
      success: true,
      message: 'New idea added!',
    }
  })

  ipcMain.handle(IPC_CHANNELS.EDIT_IDEA, (event, updatedIdea: Idea) => {
    db.read()
    const index = db.data.ideas.findIndex((idea) => idea.id === updatedIdea.id)
    if (index === -1) return { success: false, message: 'Idea not found' }

    const ideaToUpdate = db.data.ideas[index]
    ideaToUpdate.title = updatedIdea.title
    ideaToUpdate.description = updatedIdea.description

    db.write()
    event.sender.send(IPC_CHANNELS.IDEAS_UPDATED)
    return {
      success: true,
      message: 'Idea updated!',
    }
  })

  ipcMain.handle(IPC_CHANNELS.DELETE_IDEA, (event, id: number) => {
    db.read()
    const ideaToDeleteIndex = db.data.ideas.findIndex((idea) => idea.id === id)
    if (ideaToDeleteIndex === -1)
      return {
        success: false,
        message: 'Idea not found',
      }

    const ideas = db.data.ideas
    const ideaToDelete = ideas[ideaToDeleteIndex]

    ideas.splice(ideaToDeleteIndex, 1)
    normalizePositionAfterDeletion(ideas, ideaToDelete.position)

    db.write()
    event.sender.send(IPC_CHANNELS.IDEAS_UPDATED)
    return {
      success: true,
      message: 'Idea deleted!',
    }
  })

  ipcMain.handle(IPC_CHANNELS.CONVERT_IDEA_TO_PROJECT, (event, id: number) => {
    db.read()

    const ideaToConvert = db.data.ideas.find((idea) => idea.id === id)
    if (!ideaToConvert) return { success: false, message: 'Idea not found' }

    const nextId = (db.data.questlines.at(-1)?.id || 0) + 1
    const nextPosition = db.data.questlines.length

    db.data.questlines.push({
      id: nextId,
      title: ideaToConvert.title,
      description: ideaToConvert.description,
      time_spent: 0,
      active: false,
      completed: false,
      created_at: getToday(),
      position: nextPosition,
    })

    const ideas = db.data.ideas
    ideas.forEach((idea) => {
      if (idea.position > ideaToConvert.position) {
        idea.position--
      }
    })

    db.data.ideas = ideas.filter((idea) => idea.id !== id)
    db.write()
    event.sender.send(IPC_CHANNELS.IDEAS_UPDATED)
    event.sender.send(IPC_CHANNELS.QUESTLINES_UPDATED)
    return { success: true, message: 'New Project started!' }
  })
}
