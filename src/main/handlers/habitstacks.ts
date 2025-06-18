import { ipcMain } from 'electron'
import db from '../db/lowdb.js'
import { IPC_CHANNELS } from '../channels'
import { HabitStack } from '../db/types'

import { normalizePositionAfterDeletion } from '../helpers/positionNormalizer.js'

export function registerHabitStackHandlers() {
  ipcMain.handle(IPC_CHANNELS.GET_HABIT_STACKS, () => db.data.habit_stacks)

  ipcMain.handle(IPC_CHANNELS.ADD_HABIT_STACK, (event, addedHabitStack: HabitStack) => {
    db.read()
    const nextId = (db.data.habit_stacks.at(-1)?.id || 0) + 1
    const nextPosition = db.data.habit_stacks.length

    if (!addedHabitStack.title || addedHabitStack.title.trim() === '') {
      return {
        success: false,
        message: 'Title is required',
      }
    }

    const newHabitStack = {
      id: nextId,
      title: addedHabitStack.title,
      position: nextPosition,
    }
    db.data.habit_stacks.push(newHabitStack)

    db.write()
    event.sender.send(IPC_CHANNELS.HABIT_STACKS_UPDATED)
    return {
      success: true,
      message: 'New habit stack added!',
    }
  })

  ipcMain.handle(IPC_CHANNELS.EDIT_HABIT_STACK, (event, editedHabitStack: HabitStack) => {
    db.read()
    const index = db.data.habit_stacks.findIndex(
      (habitStack) => habitStack.id === editedHabitStack.id,
    )
    if (index === -1) return { success: false, message: 'Habit stack not found' }

    const habitStackToUpdate = db.data.habit_stacks[index]
    habitStackToUpdate.title = editedHabitStack.title

    db.write()
    event.sender.send(IPC_CHANNELS.HABIT_STACKS_UPDATED)

    return {
      success: true,
      message: 'Habit stack updated!',
    }
  })

  ipcMain.handle(IPC_CHANNELS.DELETE_HABIT_STACK, (event, id: number) => {
    db.read()
    const habitStackToDeleteIndex = db.data.habit_stacks.findIndex(
      (habitStack) => habitStack.id === id,
    )
    if (habitStackToDeleteIndex === -1)
      return {
        success: false,
        message: 'Habitstack not found',
      }

    const habitsInStack = db.data.habits.filter((habit) => habit.stack_id === id)
    if (habitsInStack.length > 0) {
      return {
        success: false,
        message: 'There are habits in this stack!',
      }
    }

    const habitStacks = db.data.habit_stacks
    const habitStackToDelete = habitStacks[habitStackToDeleteIndex]

    habitStacks.splice(habitStackToDeleteIndex, 1)
    normalizePositionAfterDeletion(habitStacks, habitStackToDelete.position)

    db.write()
    event.sender.send(IPC_CHANNELS.HABIT_STACKS_UPDATED)
    return {
      success: true,
      message: 'Habit stack deleted!',
    }
  })
}
