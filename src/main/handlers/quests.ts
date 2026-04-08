import { ipcMain } from 'electron'
import db from '../db/lowdb.js'
import { IPC_CHANNELS } from '../channels'

import { Quest } from '../db/types'
import { useQuests } from '../services/useQuests'
const { addQuest, editQuest, deleteQuest, activateQuest, claimQuestReward } = useQuests()

export function registerQuestHandlers() {
  ipcMain.handle(IPC_CHANNELS.GET_QUESTS, () => db.data.quests)

  ipcMain.handle(IPC_CHANNELS.ADD_QUEST, (event, addedQuest: Quest) => {
    db.read()

    const result = addQuest(addedQuest, db.data.quests, db.data.tags)
    if (!result.titleValid) return { success: false, message: 'Title is required' }
    if (!result.primaryTagValid) return { success: false, message: 'Primary skill is required' }
    if (!result.secondaryTagValid) return { success: false, message: 'Secondary skill is invalid' }

    db.data.quests = result.updatedQuests
    db.write()

    event.sender.send(IPC_CHANNELS.QUESTS_UPDATED)
    event.sender.send(IPC_CHANNELS.QUESTLINES_UPDATED)
    return {
      success: true,
      message: 'New quest added!',
    }
  })

  ipcMain.handle(IPC_CHANNELS.EDIT_QUEST, (event, editedQuest: Quest) => {
    db.read()
    const result = editQuest(editedQuest, db.data.quests, db.data.tags)
    if (!result.questExists) return { success: false, message: 'Quest not found' }
    if (!result.titleValid) return { success: false, message: 'Title is required' }
    if (!result.primaryTagValid) return { success: false, message: 'Primary skill is required' }
    if (!result.secondaryTagValid) return { success: false, message: 'Secondary skill is invalid' }

    db.data.quests = result.updatedQuests
    db.write()

    event.sender.send(IPC_CHANNELS.QUESTS_UPDATED)
    return { success: true, message: 'Quest updated!' }
  })

  ipcMain.handle(IPC_CHANNELS.DELETE_QUEST, (event, id: number) => {
    db.read()
    const result = deleteQuest(id, db.data.quests, db.data.tasks)
    if (!result.questExists) return { success: false, message: 'Quest not found' }

    db.data.quests = result.updatedQuests
    db.data.tasks = result.updatedTasks
    db.write()

    event.sender.send(IPC_CHANNELS.QUESTS_UPDATED)
    return { success: true, message: 'Quest deleted!' }
  })

  ipcMain.handle(IPC_CHANNELS.ACTIVATE_QUEST, (event, quest: Quest) => {
    db.read()
    const result = activateQuest(quest, db.data.quests)
    if (!result.questExists) return { success: false, message: 'Quest not found' }
    if (result.alreadyActive) return { success: false, message: 'Quest already active' }

    db.data.quests = result.updatedQuests
    db.write()

    event.sender.send(IPC_CHANNELS.QUESTS_UPDATED)
    return { success: true, message: 'Quest activated!' }
  })

  ipcMain.handle(IPC_CHANNELS.CLAIM_QUEST_REWARD, (event, quest: Quest) => {
    db.read()

    const result = claimQuestReward(
      quest,
      db.data.quests,
      db.data.user,
      db.data.tasks,
      db.data.tags,
    )
    if (!result.questExists) return { success: false, message: 'Quest not found' }
    if (result.notCompleted) return { success: false, message: 'Quest not completed' }

    db.data.user = result.updatedUser
    db.data.quests = result.updatedQuests
    db.data.tags = result.updatedTags
    db.data.tasks = result.updatedTasks
    db.write()

    event.sender.send(IPC_CHANNELS.USER_UPDATED)
    event.sender.send(IPC_CHANNELS.QUESTS_UPDATED)
    event.sender.send(IPC_CHANNELS.QUESTLINES_UPDATED)
    event.sender.send(IPC_CHANNELS.TASKS_UPDATED)
    return {
      success: true,
      crystalsGained: result.crystalsGained,
      userExpGained: result.userExpGained,
      tagExpGained: result.tagExpGained,
      levelUp: result.levelUp,
      tagLevelUps: result.tagLevelUps,
      tagTitles: result.tagTitles,
    }
  })
}
