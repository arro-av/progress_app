import { ipcMain } from 'electron'
import db from '../db/lowdb.js'
import { IPC_CHANNELS } from '../channels'

import { Questline } from '../db/types'
import { useQuestlines } from '../services/useQuestlines'
const { editQuestline, deleteQuestline, activateQuestline, claimQuestlineReward } = useQuestlines()

export function registerQuestlineHandlers() {
  ipcMain.handle(IPC_CHANNELS.GET_QUESTLINES, () => db.data.questlines)

  ipcMain.handle(IPC_CHANNELS.EDIT_QUESTLINE, (event, editedQuestline: Questline) => {
    db.read()

    const result = editQuestline(editedQuestline, db.data.questlines)
    if (!result.questlineExists) return { success: false, message: 'Questline not found' }
    if (!result.titleValid) return { success: false, message: 'Title is required' }
    if (!result.descriptionValid) return { success: false, message: 'Description is required' }

    db.data.questlines = result.updatedQuestlines
    db.write()

    event.sender.send(IPC_CHANNELS.QUESTLINES_UPDATED)
    return { success: true, message: 'Questline updated!' }
  })

  ipcMain.handle(IPC_CHANNELS.DELETE_QUESTLINE, (event, id: number) => {
    db.read()

    const result = deleteQuestline(id, db.data.questlines, db.data.quests, db.data.tasks)
    if (!result.questlineExists) return { success: false, message: 'Questline not found' }

    db.data.questlines = result.updatedQuestlines
    db.data.quests = result.updatedQuests
    db.data.tasks = result.updatedTasks
    db.write()

    event.sender.send(IPC_CHANNELS.QUESTLINES_UPDATED)
    event.sender.send(IPC_CHANNELS.QUESTS_UPDATED)
    return { success: true, message: 'Questline deleted!' }
  })

  ipcMain.handle(IPC_CHANNELS.ACTIVATE_QUESTLINE, (event, questline: Questline) => {
    db.read()

    const result = activateQuestline(questline, db.data.questlines)
    if (!result.questlineExists) return { success: false, message: 'Questline not found' }
    if (result.alreadyActive) return { success: false, message: 'Questline already active' }

    db.data.questlines = result.updatedQuestlines
    db.write()

    event.sender.send(IPC_CHANNELS.QUESTLINES_UPDATED)
    return { success: true, message: 'Questline activated!' }
  })

  ipcMain.handle(IPC_CHANNELS.CLAIM_QUESTLINE_REWARD, (event, questline: Questline) => {
    db.read()

    const result = claimQuestlineReward(
      questline,
      db.data.questlines,
      db.data.questlines_done,
      db.data.user,
      db.data.quests,
      db.data.tasks,
    )
    if (!result.questlineExists) return { success: false, message: 'Questline not found' }
    if (result.notCompleted) return { success: false, message: 'Questline not completed' }

    db.data.questlines = result.updatedQuestlines
    db.data.questlines_done = result.updatedQuestlinesDone
    db.data.user = result.updatedUser
    db.write()

    event.sender.send(IPC_CHANNELS.QUESTLINES_UPDATED)
    event.sender.send(IPC_CHANNELS.USER_UPDATED)
    return {
      success: true,
      crystalsGained: result.crystalsGained,
      userExpGained: result.userExpGained,
      levelUp: result.levelUp,
    }
  })
}
