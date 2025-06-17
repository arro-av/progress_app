import { ipcMain } from 'electron'
import db from '../../db/lowdb.js'
import { IPC_CHANNELS } from '../channels'
import { Quest } from '../../db/types'

import { useProgressions } from '../../../shared/helpers/useProgressions'
const { getQuestProgressionReward, updateLevel } = useProgressions()

import { normalizePositionAfterDeletion } from '../../helpers/positionNormalizer.js'

export function registerQuestHandlers() {
  ipcMain.handle(IPC_CHANNELS.GET_QUESTS, () => db.data.quests)
  ipcMain.handle(IPC_CHANNELS.ADD_QUEST, (event, addedQuest: Quest) => {
    db.read()
    const nextId = (db.data.quests.at(-1)?.id || 0) + 1
    const nextPosition = db.data.quests.filter(
      (quest) => quest.questline_id === addedQuest.questline_id,
    ).length

    if (!addedQuest.title || addedQuest.title.trim() === '') {
      return {
        success: false,
        message: 'Title is required',
      }
    }

    if (!addedQuest.questline_id) {
      return {
        success: false,
        message: 'Questline ID is required',
      }
    }

    if (!addedQuest.tag_name) {
      return {
        success: false,
        message: 'Tag name is required',
      }
    }

    const newQuest = {
      id: nextId,
      title: addedQuest.title,
      time_spent: addedQuest.time_spent,
      questline_id: addedQuest.questline_id,
      tag_name: addedQuest.tag_name,
      position: nextPosition,
    }
    db.data.quests.push(newQuest)

    const questlineIndex = db.data.questlines.findIndex(
      (questline) => questline.id === addedQuest.questline_id,
    )
    if (questlineIndex !== -1) db.data.questlines[questlineIndex].completed = false

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
    const index = db.data.quests.findIndex((quest) => quest.id === editedQuest.id)
    if (index === -1) return { success: false, message: 'Quest not found' }

    const questToUpdate = db.data.quests[index]
    questToUpdate.title = editedQuest.title
    questToUpdate.tag_name = editedQuest.tag_name

    db.write()
    event.sender.send(IPC_CHANNELS.QUESTS_UPDATED)
    return { success: true, message: 'Quest updated!' }
  })

  ipcMain.handle(IPC_CHANNELS.DELETE_QUEST, (event, id: number) => {
    db.read()
    const index = db.data.quests.findIndex((quest) => quest.id === id)
    if (index === -1) return { success: false, message: 'Quest not found' }

    const quests = db.data.quests
    const questToDelete = quests[index]
    const questToDeleteQuestline = questToDelete.questline_id
    const questsInQuestline = quests.filter((q) => q.questline_id === questToDeleteQuestline)

    quests.splice(index, 1)
    normalizePositionAfterDeletion(questsInQuestline, questToDelete.position)

    // delete associated Tasks
    const tasksInQuest = db.data.tasks.filter((task) => task.quest_id === id)
    tasksInQuest.forEach((task) => {
      db.data.tasks.splice(
        db.data.tasks.findIndex((t) => t.id === task.id),
        1,
      )
    })

    db.write()
    event.sender.send(IPC_CHANNELS.QUESTS_UPDATED)
    return { success: true, message: 'Quest deleted!' }
  })

  ipcMain.handle(IPC_CHANNELS.CLAIM_QUEST_REWARD, (event, quest: Quest) => {
    db.read()
    const questline = db.data.questlines.find((ql) => ql.id === quest.questline_id)
    if (!questline) return { success: false, message: 'Questline not found' }

    const claimedQuestPosition = quest.position
    const questsInQuestline = db.data.quests.filter((q) => q.questline_id === questline.id)

    // Calculate rewards first
    const reward = getQuestProgressionReward(quest, questsInQuestline)
    const { crystals: crystalsGained, userExp: userExpGained, tagExp: tagExpGained } = reward

    // Update user and tag
    const user = db.data.user
    const userLvlBefore = user.level

    const tag = db.data.tags.find((t) => t.title === quest.tag_name)
    if (!tag) return { success: false, message: 'Tag not found' }
    const tagLvlBefore = tag.level
    const tagTitle = tag.title

    updateLevel(user, userExpGained, true)
    updateLevel(tag, tagExpGained, false)

    // Update balances and stats
    user.balance += crystalsGained
    user.exp_gained += userExpGained
    user.crystals_gained += crystalsGained
    user.todos_done += 1

    // Clean up completed quest and its tasks
    db.data.tasks = db.data.tasks.filter((task) => task.quest_id !== quest.id)
    db.data.quests = db.data.quests.filter((q) => q.id !== quest.id)

    // Update questline status if needed
    if (questsInQuestline.length <= 1) {
      // Current quest is the last one
      questline.completed = true
    }

    // Normalize positions
    questsInQuestline.forEach((q) => {
      if (q.position > claimedQuestPosition && q.questline_id === questline.id) {
        q.position--
      }
    })

    const levelUp = user.level > userLvlBefore
    const tagLevelUp = tag.level > tagLvlBefore

    db.write()

    // Send updates
    event.sender.send(IPC_CHANNELS.USER_UPDATED)
    event.sender.send(IPC_CHANNELS.QUESTS_UPDATED)
    event.sender.send(IPC_CHANNELS.QUESTLINES_UPDATED)
    event.sender.send(IPC_CHANNELS.TASKS_UPDATED)

    return {
      success: true,
      crystalsGained,
      userExpGained,
      tagExpGained,
      levelUp,
      tagLevelUp,
      tagTitle,
    }
  })
}
