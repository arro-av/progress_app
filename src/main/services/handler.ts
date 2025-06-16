import { ipcMain } from 'electron'
import db from '../db/lowdb.js'
import { IPC_CHANNELS } from './channels'
import { Idea, HabitStack, Questline, Quest, Task } from '../db/types'

import { registerMoveItemHandler } from './handlers/moveItem'
import { registerHabitHandlers } from './handlers/habits'
import { registerTagHandlers } from './handlers/tags'
import { registerRewardHandlers } from './handlers/rewards'
import { registerHabitStackHandlers } from './handlers/habitstacks'

import { useDates } from '../../shared/helpers/useDate'
import { useProgressions } from '../../shared/helpers/useProgressions'

const { getToday } = useDates()
const { getQuestProgressionReward, updateLevel } = useProgressions()

export function registerDBHandlers() {
  registerMoveItemHandler()
  registerTagHandlers()
  registerHabitHandlers()
  registerHabitStackHandlers()
  registerRewardHandlers()

  // ========== UNIVERSAL ==========

  ipcMain.handle(
    IPC_CHANNELS.GET_ITEMS,
    (
      event,
      type:
        | 'rewards'
        | 'ideas'
        | 'tags'
        | 'habits'
        | 'habit_stacks'
        | 'questlines'
        | 'quests'
        | 'tasks'
        | 'user',
    ) => {
      db.read()
      return db.data[type]
    },
  )

  ipcMain.handle(
    IPC_CHANNELS.DELETE_ITEM,
    (
      event,
      id: number,
      type:
        | 'rewards'
        | 'ideas'
        | 'tags'
        | 'habits'
        | 'habit_stacks'
        | 'questlines'
        | 'quests'
        | 'tasks',
    ) => {
      db.read()
      const items = db.data[type]
      const itemToDeleteIndex = items.findIndex((item) => item.id === id)
      if (itemToDeleteIndex === -1)
        return {
          success: false,
          message: `${type.charAt(0).toUpperCase() + type.slice(1)} not found`,
        }

      // Handle position updates of non nested items
      const itemToDelete = items[itemToDeleteIndex]

      if (type !== 'habits' && type !== 'tasks') {
        items.forEach((item) => {
          if (item.position > itemToDelete.position) {
            item.position--
          }
        })
      }

      // Handle position updates of nested habits
      if (type === 'habits') {
        const habits = db.data.habits
        const habitToDelete = habits[itemToDeleteIndex]
        const habitToDeleteStack = habitToDelete.stack_id
        habits.forEach((habit) => {
          if (habit.stack_id === habitToDeleteStack && habit.position > habitToDelete.position) {
            habit.position--
          }
        })
      }

      // Handle position updates of nested todo_items
      if (type === 'quests') {
        const quests = db.data.quests
        const questToDelete = quests[itemToDeleteIndex]
        const questToDeleteQuestline = questToDelete.questline_id
        quests.forEach((quest) => {
          if (
            quest.questline_id === questToDeleteQuestline &&
            quest.position > questToDelete.position
          ) {
            quest.position--
          }
        })
      }

      if (type === 'habit_stacks') {
        const numberOfHabitsInStack = db.data.habits.filter(
          (habit) => habit.stack_id === itemToDelete.id,
        ).length
        if (numberOfHabitsInStack > 0)
          return { success: false, message: 'There are still habits in this stack!' }
      }

      if (type === 'quests') {
        const numberOfTasksInQuest = db.data.tasks.filter(
          (task) => task.quest_id === itemToDelete.id,
        ).length
        if (numberOfTasksInQuest > 0)
          return { success: false, message: 'There are still tasks in this quest!' }
      }

      items.splice(itemToDeleteIndex, 1)
      db.write()
      event.sender.send(IPC_CHANNELS[type.toUpperCase() + '_UPDATED'])
      return {
        success: true,
        message: `${type.charAt(0).toUpperCase() + type.slice(1, -1)} deleted!`,
      }
    },
  )

  // ========== USER ==========
  ipcMain.handle(IPC_CHANNELS.GET_BALANCE, (event) => {
    db.read()
    const balance = db.data.user.balance
    return balance
  })

  ipcMain.handle(IPC_CHANNELS.GET_USER_EXP, (event) => {
    db.read()
    const expCurrent = db.data.user.exp_current
    const expNeeded = db.data.user.exp_needed
    return { expCurrent, expNeeded }
  })

  ipcMain.handle(IPC_CHANNELS.GET_USER_LEVEL, (event) => {
    db.read()
    const level = db.data.user.level
    return level
  })

  ipcMain.handle(IPC_CHANNELS.ADD_TIME, (event, timeSpent: number) => {
    db.read()
    const user = db.data.user
    const currentActiveQuestline = db.data.questlines.find((questline) => questline.active)
    if (!currentActiveQuestline) return { success: false, message: 'No active questline found' }

    const firstQuestInCurrentActiveQuestline = db.data.quests.find(
      (quest) => quest.questline_id === currentActiveQuestline.id,
    )
    if (!firstQuestInCurrentActiveQuestline)
      return { success: false, message: 'No quest found for active questline' }

    const roundedTimeSpent = Math.round(timeSpent)

    user.pomodoros++
    user.focused_time += roundedTimeSpent
    currentActiveQuestline.time_spent += roundedTimeSpent
    firstQuestInCurrentActiveQuestline.time_spent += roundedTimeSpent

    db.write()
    event.sender.send(IPC_CHANNELS.USER_LEVEL_UPDATED, db.data.user.level)
    event.sender.send(IPC_CHANNELS.QUESTLINES_UPDATED)
    event.sender.send(IPC_CHANNELS.QUESTS_UPDATED)
    return { success: true }
  })

  // ========== QUESTLINES ==========
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

  ipcMain.handle(IPC_CHANNELS.ACTIVATE_QUESTLINE, (event, questline: Questline) => {
    db.read()
    const index = db.data.questlines.findIndex((questline) => questline.id === questline.id)
    if (index === -1) return { success: false, message: 'Questline not found' }

    const questlineToUpdate = db.data.questlines[index]
    if (questlineToUpdate.active) return { success: false, message: 'Questline already active' }

    const currentActiveQuestline = db.data.questlines.find((questline) => questline.active)
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
    const questlineIndex = db.data.questlines.findIndex(
      (questline) => questline.id === questline.id,
    )
    if (questlineIndex === -1) return { success: false, message: 'Questline not found' }

    const questlineToUpdate = db.data.questlines[questlineIndex]
    const user = db.data.user
    const userLvlBefore = user.level

    let crystalsGained = 0
    let userExpGained = 0
    let levelUp = false

    if (!questlineToUpdate.completed) return { success: false, message: 'Questline not completed' }
    const reward = getQuestProgressionReward(questlineToUpdate)
    crystalsGained = reward.crystals
    userExpGained = reward.userExp

    user.exp_gained += userExpGained
    user.crystals_gained += crystalsGained

    updateLevel(user, userExpGained, true)
    levelUp = user.level > userLvlBefore

    const nextDoneId = (db.data.questlines_done.at(-1)?.id || 0) + 1
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
    event.sender.send(IPC_CHANNELS.BALANCE_UPDATED, db.data.user.balance)
    event.sender.send(
      IPC_CHANNELS.USER_EXP_UPDATED,
      db.data.user.exp_current,
      db.data.user.exp_needed,
    )
    event.sender.send(IPC_CHANNELS.USER_LEVEL_UPDATED, db.data.user.level)

    return { success: true, crystalsGained, userExpGained, levelUp }
  })

  // ========== QUESTS ==========

  ipcMain.handle(IPC_CHANNELS.ADD_QUEST, (event, addedQuest: Quest) => {
    db.read()
    const nextId = (db.data.quests.at(-1)?.id || 0) + 1
    const nextPosition = db.data.quests.length

    if (!addedQuest.title || addedQuest.title.trim() === '') {
      return {
        success: false,
        message: 'Title is required',
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

  ipcMain.handle(IPC_CHANNELS.CLAIM_QUEST_REWARD, (event, quest: Quest) => {
    db.read()
    const claimedQuestTasks = db.data.tasks.filter((task) => task.quest_id === quest.id)
    const project = db.data.questlines.find((project) => project.id === quest.questline_id)
    if (!project) return { success: false, message: 'Project not found' }

    const claimedQuestPosition = quest.position

    const user = db.data.user
    const userLvlBefore = user.level

    const tag = db.data.tags.find((tag) => tag.title === quest.tag_name)
    if (!tag) return { success: false, message: 'Tag not found' }
    const tagLvlBefore = tag.level
    const tagTitle = tag.title

    let crystalsGained = 0
    let userExpGained = 0
    let tagExpGained = 0

    if (claimedQuestTasks.every((task) => task.completed)) {
      const reward = getQuestProgressionReward(quest, claimedQuestTasks)

      console.log(reward)
      crystalsGained = reward.crystals
      userExpGained = reward.userExp
      tagExpGained = reward.tagExp

      updateLevel(user, userExpGained, true)
      updateLevel(tag, tagExpGained, false)

      db.data.user.balance += crystalsGained
      db.data.user.exp_current += userExpGained
      db.data.user.exp_needed += userExpGained

      user.exp_gained += userExpGained
      user.crystals_gained += crystalsGained

      db.data.tasks = db.data.tasks.filter((task) => task.quest_id !== quest.id)

      const questIndex = db.data.quests.findIndex((q) => q.id === quest.id)

      if (questIndex !== -1) {
        db.data.quests.splice(questIndex, 1)
      }
    } else {
      return { success: false, message: 'Not all tasks completed' }
    }

    let levelUp = false
    if (userLvlBefore < user.level) {
      levelUp = true
    }

    // check if tag leveled up
    let tagLevelUp = false
    if (tagLvlBefore < tag.level) {
      tagLevelUp = true
    }

    const questsInProject = db.data.quests.filter((quest) => quest.questline_id === project.id)
    if (questsInProject.length === 0) {
      project.completed = true
    }

    //TODO Look for better normalisation of pos solution (maybe global event watcher or smth idk)
    db.data.quests.forEach((quest) => {
      if (quest.position > claimedQuestPosition && quest.questline_id === project.id) {
        quest.position--
      }
    })

    db.write()
    event.sender.send(IPC_CHANNELS.BALANCE_UPDATED, db.data.user.balance)
    event.sender.send(
      IPC_CHANNELS.USER_EXP_UPDATED,
      db.data.user.exp_current,
      db.data.user.exp_needed,
    )
    event.sender.send(IPC_CHANNELS.USER_LEVEL_UPDATED, db.data.user.level)
    event.sender.send(IPC_CHANNELS.QUESTS_UPDATED)
    event.sender.send(IPC_CHANNELS.QUESTLINES_UPDATED)

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

  // ========== TASK ==========

  ipcMain.handle(IPC_CHANNELS.ADD_TASK, (event, addedTask: Task) => {
    db.read()
    const nextId = (db.data.tasks.at(-1)?.id || 0) + 1
    const nextPosition = db.data.tasks.filter((task) => task.quest_id === addedTask.quest_id).length

    if (!addedTask.title || addedTask.title.trim() === '') {
      return {
        success: false,
        message: 'Title is required',
      }
    }

    const newTask = {
      id: nextId,
      title: addedTask.title,
      quest_id: addedTask.quest_id,
      completed: false,
      position: nextPosition,
    }
    db.data.tasks.push(newTask)

    db.write()
    event.sender.send(IPC_CHANNELS.TASKS_UPDATED)
    event.sender.send(IPC_CHANNELS.QUESTS_UPDATED)
    event.sender.send(IPC_CHANNELS.QUESTLINES_UPDATED)
    return {
      success: true,
      message: 'New task added!',
    }
  })

  ipcMain.handle(IPC_CHANNELS.EDIT_TASK, (event, editedTask: Task) => {
    db.read()
    const index = db.data.tasks.findIndex((task) => task.id === editedTask.id)
    if (index === -1) return { success: false, message: 'Task not found' }

    const tasks = db.data.tasks
    const taskToUpdate = tasks[index]
    const newQuest = editedTask.quest_id
    const oldQuest = taskToUpdate.quest_id

    if (newQuest !== oldQuest) {
      // update position of tasks in the old quest
      tasks.forEach((task) => {
        if (task.quest_id === oldQuest && task.position > taskToUpdate.position) {
          task.position--
        }
      })
      // put edited task in the end of the new quest
      taskToUpdate.position = tasks.filter((task) => task.quest_id === newQuest).length
    }

    taskToUpdate.title = editedTask.title
    taskToUpdate.quest_id = editedTask.quest_id

    db.write()
    event.sender.send(IPC_CHANNELS.TASKS_UPDATED)
    event.sender.send(IPC_CHANNELS.QUESTS_UPDATED)
    event.sender.send(IPC_CHANNELS.QUESTLINES_UPDATED)
    return { success: true, message: 'Task updated!' }
  })

  ipcMain.handle(IPC_CHANNELS.TOGGLE_TASK_COMPLETION, (event, task: Task) => {
    db.read()
    const dbTask = db.data.tasks.find((task) => task.id === task.id)
    if (!dbTask) return { success: false, message: 'Task not found' }

    dbTask.completed = !dbTask.completed

    db.data.user.todos_done += 1

    db.write()

    event.sender.send(IPC_CHANNELS.TASKS_UPDATED)
    return { success: true }
  })

  // ========== IDEAS ==========

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
