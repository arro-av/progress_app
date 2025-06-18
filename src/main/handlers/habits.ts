import { ipcMain } from 'electron'
import db from '../db/lowdb.js'
import { IPC_CHANNELS } from '../channels'
import { Habit } from '../db/types'

import { useProgressions } from '../../shared/helpers/useProgressions'
const { getHabitProgressionReward, updateLevel } = useProgressions()

import { getDates } from '../helpers/getDates.js'
const { getToday, getYesterday } = getDates()

import { normalizePositionAfterDeletion } from '../helpers/positionNormalizer.js'

export function registerHabitHandlers() {
  ipcMain.handle(IPC_CHANNELS.GET_HABITS, () => db.data.habits)

  ipcMain.handle(IPC_CHANNELS.ADD_HABIT, (event, addedHabit: Habit) => {
    db.read()
    const nextId = (db.data.habits.at(-1)?.id || 0) + 1
    // find the next position in the same stack
    const nextPosition = db.data.habits.filter(
      (habit) => habit.stack_id === addedHabit.stack_id,
    ).length

    if (!addedHabit.title || addedHabit.title.trim() === '') {
      return {
        success: false,
        message: 'Title is required',
      }
    }
    if (!addedHabit.tag_name) {
      return {
        success: false,
        message: 'Tag is required',
      }
    }
    if (!addedHabit.stack_id) {
      return {
        success: false,
        message: 'Stack ID is required',
      }
    }

    const newHabit = {
      id: nextId,
      title: addedHabit.title,
      tag_name: addedHabit.tag_name,
      counter: 0,
      current_streak: 0,
      best_streak: 0,
      stack_id: addedHabit.stack_id,
      position: nextPosition,
      last_month_completed: [],
    }
    db.data.habits.push(newHabit)

    db.write()
    event.sender.send(IPC_CHANNELS.HABITS_UPDATED)
    return {
      success: true,
      message: 'New Habit added!',
      addedHabit,
    }
  })

  ipcMain.handle(IPC_CHANNELS.EDIT_HABIT, (event, editedHabit: Habit) => {
    db.read()
    const index = db.data.habits.findIndex((habit) => habit.id === editedHabit.id)
    if (index === -1) return { success: false, message: 'Habit not found' }

    const habits = db.data.habits
    const habitToUpdate = habits[index]
    const newHabitStack = editedHabit.stack_id
    const oldHabitStack = habitToUpdate.stack_id
    const habitsInOldStack = habits.filter((habit) => habit.stack_id === oldHabitStack)
    const habitsInNewStack = habits.filter((habit) => habit.stack_id === newHabitStack)

    if (newHabitStack !== oldHabitStack) {
      normalizePositionAfterDeletion(habitsInOldStack, habitToUpdate.position)
      habitToUpdate.position = habitsInNewStack.length
    }

    habitToUpdate.title = editedHabit.title
    habitToUpdate.tag_name = editedHabit.tag_name
    habitToUpdate.stack_id = editedHabit.stack_id

    db.write()
    event.sender.send(IPC_CHANNELS.HABITS_UPDATED)
    return { success: true, message: 'Habit updated!' }
  })

  ipcMain.handle(IPC_CHANNELS.DELETE_HABIT, (event, id: number) => {
    db.read()
    const index = db.data.habits.findIndex((habit) => habit.id === id)
    if (index === -1) return { success: false, message: 'Habit not found' }

    const habits = db.data.habits
    const habitToDelete = habits[index]
    const habitToDeleteStack = habitToDelete.stack_id
    const habitsInSameStack = habits.filter((habit) => habit.stack_id === habitToDeleteStack)

    habits.splice(index, 1)
    normalizePositionAfterDeletion(habitsInSameStack, habitToDelete.position)

    db.write()
    event.sender.send(IPC_CHANNELS.HABITS_UPDATED)
    return { success: true, message: 'Habit deleted!' }
  })

  ipcMain.handle(IPC_CHANNELS.TOGGLE_HABIT_COMPLETION, (event, habit: Habit) => {
    db.read()
    const dbHabit = db.data.habits.find((h) => h.id === habit.id)
    if (!dbHabit) return { success: false, message: 'Habit not found' }

    const user = db.data.user
    const tag = db.data.tags.find((tag) => tag.title === habit.tag_name)
    if (!tag) return { success: false, message: 'Tag not found' }

    const today = getToday()
    const habitCheckedToday = habit.last_month_completed.includes(today)

    // reward for habit completetion
    const reward = getHabitProgressionReward(habit)
    const crystals = reward.crystals + habit.current_streak
    const exp = reward.exp + habit.current_streak

    const userLvlBefore = user.level
    const tagLvlBefore = tag.level
    const tagTitle = tag.title

    // revert changes if habit was checked today
    if (habitCheckedToday) {
      const lastEntryIndex = habit.last_month_completed.length - 1
      dbHabit.last_month_completed.splice(lastEntryIndex, 1)
      dbHabit.counter--
      dbHabit.current_streak--

      // avoid new current_streak subtracting more than the initial habit check rewarded
      user.balance -= crystals - 1

      user.exp_gained -= exp - 1
      user.crystals_gained -= crystals - 1

      //handle level ups
      updateLevel(user, -exp + 1, true)
      updateLevel(tag, -exp + 1, false)
      // add changes if habit was not checked today
    } else {
      dbHabit.last_month_completed.push(today)
      dbHabit.counter++
      dbHabit.current_streak++

      user.balance += crystals

      user.exp_gained += exp
      user.crystals_gained += crystals

      //handle level ups
      updateLevel(user, exp, true)
      updateLevel(tag, exp, false)
    }

    // check if user leveled up
    let levelUp = false
    if (userLvlBefore < user.level) {
      levelUp = true
    }

    // check if tag leveled up
    let tagLevelUp = false
    if (tagLvlBefore < tag.level) {
      tagLevelUp = true
    }

    // check if habitcounter surpassed 60
    if (dbHabit.counter >= 60) {
      db.data.user.habits_implemented++
    }

    db.write()

    event.sender.send(IPC_CHANNELS.HABITS_UPDATED)
    event.sender.send(IPC_CHANNELS.USER_UPDATED)
    return { success: true, exp, crystals, levelUp, tagLevelUp, tagTitle }
  })

  ipcMain.handle(IPC_CHANNELS.UPDATE_ALL_STREAKS, (event) => {
    db.read()
    const habits = db.data.habits

    const today = getToday()
    const yesterday = getYesterday()

    habits.forEach((habit) => {
      const completetionArray = habit.last_month_completed
      const lastCompletionIndex = completetionArray.length - 1
      const lastCompletion = completetionArray[lastCompletionIndex]

      if (lastCompletion === today || lastCompletion === yesterday) {
        return { success: false }
      } else {
        if (habit.best_streak < habit.current_streak) habit.best_streak = habit.current_streak
        habit.current_streak = 0
      }
    })

    event.sender.send(IPC_CHANNELS.HABITS_UPDATED)
    db.write()
    return { success: true }
  })
}
