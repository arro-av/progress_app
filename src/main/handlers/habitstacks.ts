import { ipcMain } from 'electron'
import db from '../db/lowdb.js'
import { IPC_CHANNELS } from '../channels'

import { HabitStack } from '../db/types'
import { useHabitstacks } from '../services/useHabitstacks'
const { addHabitStack, editHabitStack, deleteHabitStack } = useHabitstacks()

export function registerHabitStackHandlers() {
  ipcMain.handle(IPC_CHANNELS.GET_HABIT_STACKS, () => db.data.habit_stacks)

  ipcMain.handle(IPC_CHANNELS.ADD_HABIT_STACK, (event, addedHabitStack: HabitStack) => {
    db.read()

    const result = addHabitStack(addedHabitStack, db.data.habit_stacks)
    if (!result.titleValid) return { success: false, message: 'Title is required' }

    db.data.habit_stacks = result.updatedHabitStacks
    db.write()

    event.sender.send(IPC_CHANNELS.HABIT_STACKS_UPDATED)
    return {
      success: true,
      message: 'Habitstack added!',
    }
  })

  ipcMain.handle(IPC_CHANNELS.EDIT_HABIT_STACK, (event, editedHabitStack: HabitStack) => {
    db.read()

    const result = editHabitStack(editedHabitStack, db.data.habit_stacks)
    if (!result.stackExists) return { success: false, message: 'Habitstack not found' }
    if (!result.titleValid) return { success: false, message: 'Title is required' }

    db.data.habit_stacks = result.updatedHabitStacks
    db.write()

    event.sender.send(IPC_CHANNELS.HABIT_STACKS_UPDATED)
    return {
      success: true,
      message: 'Habitstack updated!',
    }
  })

  ipcMain.handle(IPC_CHANNELS.DELETE_HABIT_STACK, (event, id: number) => {
    db.read()

    const result = deleteHabitStack(id, db.data.habit_stacks, db.data.habits)
    if (!result.stackExists) return { success: false, message: 'Habitstack not found' }
    if (result.stillHabitsInStack)
      return { success: false, message: 'There are habits in this stack!' }

    db.data.habit_stacks = result.updatedHabitStacks
    db.write()

    event.sender.send(IPC_CHANNELS.HABIT_STACKS_UPDATED)
    return {
      success: true,
      message: 'Habitstack deleted!',
    }
  })
}
