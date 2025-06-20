import { ipcMain } from 'electron'
import db from '../db/lowdb.js'
import { IPC_CHANNELS } from '../channels'

import { Habit } from '../db/types'
import { useHabits } from '../services/useHabits'
const { addHabit, editHabit, deleteHabit, toggleHabitCompletion, updateAllStreaks } = useHabits()

export function registerHabitHandlers() {
  ipcMain.handle(IPC_CHANNELS.GET_HABITS, () => db.data.habits)

  ipcMain.handle(IPC_CHANNELS.ADD_HABIT, (event, addedHabit: Habit) => {
    db.read()

    const result = addHabit(addedHabit, db.data.habits, db.data.tags)
    if (!result.titleValid) return { success: false, message: 'Title is required' }
    if (!result.tagValid) return { success: false, message: 'Tag is required' }
    if (!result.stackValid) return { success: false, message: 'Stack ID is required' }

    db.data.habits = result.updatedHabits
    db.write()

    event.sender.send(IPC_CHANNELS.HABITS_UPDATED)
    return {
      success: true,
      message: 'Habit added',
    }
  })

  ipcMain.handle(IPC_CHANNELS.EDIT_HABIT, (event, editedHabit: Habit) => {
    db.read()
    const result = editHabit(editedHabit, db.data.habits, db.data.tags)
    if (!result.habitExists) return { success: false, message: 'Habit not found' }
    if (!result.titleValid) return { success: false, message: 'Title is required' }
    if (!result.tagValid) return { success: false, message: 'Tag is required' }
    if (!result.stackValid) return { success: false, message: 'Stack ID is required' }

    db.data.habits = result.updatedHabits
    db.write()
    event.sender.send(IPC_CHANNELS.HABITS_UPDATED)
    return { success: true, message: 'Habit updated!' }
  })

  ipcMain.handle(IPC_CHANNELS.DELETE_HABIT, (event, id: number) => {
    db.read()

    const result = deleteHabit(id, db.data.habits)
    if (!result.habitExists) return { success: false, message: 'Habit not found' }

    db.data.habits = result.updatedHabits
    db.write()

    event.sender.send(IPC_CHANNELS.HABITS_UPDATED)
    return { success: true, message: 'Habit deleted!' }
  })

  ipcMain.handle(IPC_CHANNELS.TOGGLE_HABIT_COMPLETION, (event, habit: Habit) => {
    db.read()

    const result = toggleHabitCompletion(habit, db.data.habits, db.data.tags, db.data.user)
    if (!result.habitExists) return { success: false, message: 'Habit not found' }
    if (!result.tagExists) return { success: false, message: 'Tag not found' }

    db.data.habits = result.updatedHabits
    db.data.tags = result.updatedTags
    db.data.user = result.updatedUser
    db.write()

    event.sender.send(IPC_CHANNELS.HABITS_UPDATED)
    event.sender.send(IPC_CHANNELS.USER_UPDATED)
    return {
      success: true,
      exp: result.exp,
      crystals: result.crystals,
      levelUp: result.levelUp,
      tagLevelUp: result.tagLevelUp,
      tagTitle: result.tagTitle,
    }
  })

  ipcMain.handle(IPC_CHANNELS.UPDATE_ALL_STREAKS, (event) => {
    db.read()

    const result = updateAllStreaks(db.data.habits)

    db.data.habits = result.updatedHabits
    db.write()

    event.sender.send(IPC_CHANNELS.HABITS_UPDATED)
    return { success: true, lostStreaks: result.lostStreaks }
  })
}
