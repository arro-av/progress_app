import { ipcMain } from 'electron'
import db from '../db/lowdb.js'
import { IPC_CHANNELS } from '../channels'

import { Idea } from '../db/types'
import { useIdeas } from '../services/useIdeas'
const { addIdea, editIdea, deleteIdea, convertIdeaToProject } = useIdeas()

export function registerIdeaHandlers() {
  ipcMain.handle(IPC_CHANNELS.GET_IDEAS, () => db.data.ideas)

  ipcMain.handle(IPC_CHANNELS.ADD_IDEA, (event, addedIdea: Idea) => {
    db.read()

    const result = addIdea(addedIdea, db.data.ideas, db.data.user.ideas_total)
    if (!result.titleValid) return { success: false, message: 'Title is required' }
    if (!result.descriptionValid) return { success: false, message: 'Description is required' }

    db.data.ideas = result.updatedIdeas
    db.data.user.ideas_total = result.updatedTotalIdeas
    db.write()

    event.sender.send(IPC_CHANNELS.IDEAS_UPDATED)
    return {
      success: true,
      message: 'Idea added!',
    }
  })

  ipcMain.handle(IPC_CHANNELS.EDIT_IDEA, (event, updatedIdea: Idea) => {
    db.read()

    const result = editIdea(updatedIdea, db.data.ideas)
    if (!result.ideaExists) return { success: false, message: 'Idea not found' }
    if (!result.titleValid) return { success: false, message: 'Title is required' }
    if (!result.descriptionValid) return { success: false, message: 'Description is required' }

    db.data.ideas = result.updatedIdeas
    db.write()

    event.sender.send(IPC_CHANNELS.IDEAS_UPDATED)
    return {
      success: true,
      message: 'Idea updated!',
    }
  })

  ipcMain.handle(IPC_CHANNELS.DELETE_IDEA, (event, id: number) => {
    db.read()

    const result = deleteIdea(id, db.data.ideas)
    if (!result.ideaExists) return { success: false, message: 'Idea not found' }

    db.data.ideas = result.updatedIdeas
    db.write()

    event.sender.send(IPC_CHANNELS.IDEAS_UPDATED)
    return {
      success: true,
      message: 'Idea deleted!',
    }
  })

  ipcMain.handle(IPC_CHANNELS.CONVERT_IDEA_TO_PROJECT, (event, id: number) => {
    db.read()

    const result = convertIdeaToProject(id, db.data.ideas, db.data.questlines)
    if (!result.ideaExists) return { success: false, message: 'Idea not found' }

    db.data.ideas = result.updatedIdeas
    db.data.questlines = result.updatedQuestlines
    db.write()

    event.sender.send(IPC_CHANNELS.IDEAS_UPDATED)
    event.sender.send(IPC_CHANNELS.QUESTLINES_UPDATED)
    return { success: true, message: 'New Questline emerged' }
  })
}
