import { ipcMain } from 'electron'
import db from '../../db/lowdb.js'
import { IPC_CHANNELS } from '../channels'
import { Questline } from '../../db/types'

import { useProgressions } from '../../../shared/helpers/useProgressions'

const { getQuestlineProgressionReward, updateLevel } = useProgressions()

export function registerQuestlineHandlers() {
  ipcMain.handle(IPC_CHANNELS.GET_QUESTLINES, () => db.data.questlines)

  ipcMain.handle(IPC_CHANNELS.EDIT_QUESTLINE, (event, editedQuestline: Questline) => {
    db.read()
    const index = db.data.questlines.findIndex((questline) => questline.id === editedQuestline.id)
    if (index === -1) return { success: false, message: 'Questline not found' }

    const questlineToUpdate = db.data.questlines[index]
    questlineToUpdate.title = editedQuestline.title
    questlineToUpdate.description = editedQuestline.description

    db.write()
    event.sender.send(IPC_CHANNELS.QUESTLINES_UPDATED)
    return { success: true, message: 'Questline updated!' }
  })

  ipcMain.handle(IPC_CHANNELS.DELETE_QUESTLINE, (event, id: number) => {
    db.read()
    const index = db.data.questlines.findIndex((questline) => questline.id === id)
    if (index === -1) return { success: false, message: 'Questline not found' }

    db.data.questlines.splice(index, 1)

    db.write()
    event.sender.send(IPC_CHANNELS.QUESTLINES_UPDATED)
    return { success: true, message: 'Questline deleted!' }
  })

  ipcMain.handle(IPC_CHANNELS.ACTIVATE_QUESTLINE, (event, questline: Questline) => {
    db.read()
    const index = db.data.questlines.findIndex((ql) => ql.id === questline.id)
    if (index === -1) return { success: false, message: 'Questline not found' }

    const questlineToUpdate = db.data.questlines[index]
    if (questlineToUpdate.active) return { success: false, message: 'Questline already active' }

    const currentActiveQuestline = db.data.questlines.find((ql) => ql.active)
    if (currentActiveQuestline) {
      currentActiveQuestline.active = false
    }

    questlineToUpdate.active = true

    db.write()
    event.sender.send(IPC_CHANNELS.QUESTLINES_UPDATED)
    return { success: true, message: 'Questline activated!' }
  })

  ipcMain.handle(IPC_CHANNELS.CLAIM_QUESTLINE_REWARD, (event, questline: Questline) => {
    db.read()
    const questlineIndex = db.data.questlines.findIndex((ql) => ql.id === questline.id)
    if (questlineIndex === -1) return { success: false, message: 'Questline not found' }

    const questlineToUpdate = db.data.questlines[questlineIndex]
    const user = db.data.user
    const userLvlBefore = user.level

    let crystalsGained = 0
    let userExpGained = 0
    let levelUp = false

    if (!questlineToUpdate.completed) return { success: false, message: 'Questline not completed' }
    const reward = getQuestlineProgressionReward(questlineToUpdate)
    crystalsGained = reward.crystals
    userExpGained = reward.userExp

    user.exp_gained += userExpGained
    user.crystals_gained += crystalsGained

    updateLevel(user, userExpGained, true)
    levelUp = user.level > userLvlBefore

    // Ensure questlines_done exists and is an array
    if (!Array.isArray(db.data.questlines_done)) {
      db.data.questlines_done = []
    }

    const nextDoneId =
      (db.data.questlines_done.length > 0
        ? db.data.questlines_done[db.data.questlines_done.length - 1].id
        : 0) + 1
    db.data.questlines_done.push({
      id: nextDoneId,
      name: questlineToUpdate.title,
      created_at: questlineToUpdate.created_at,
      time_spent: questlineToUpdate.time_spent,
    })

    db.data.questlines = db.data.questlines.filter(
      (questline) => questline.id !== questlineToUpdate.id,
    )
    db.data.user.questlines_done += 1

    const nextQuestline = [...db.data.questlines].sort((a, b) => a.id - b.id)[0]
    if (nextQuestline) {
      nextQuestline.active = true
    }

    db.write()
    event.sender.send(IPC_CHANNELS.QUESTLINES_UPDATED)
    event.sender.send(IPC_CHANNELS.USER_UPDATED)
    return { success: true, crystalsGained, userExpGained, levelUp }
  })
}
