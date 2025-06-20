import { nextID } from '../helpers/nextID'
import { Habit, Tag, User } from '../db/types'

import { normalizePositionAfterDeletion } from '../helpers/positionNormalizer'
import { useValidations } from '../helpers/useValidations'
const { validateExistance, validateTitle, validateTag, validateStack } = useValidations()

import { updateLevels } from '../helpers/updateLevels'
const { updateUserLevel, updateTagLevel } = updateLevels()

import { getDates } from '../helpers/getDates'
const { getToday, getYesterday } = getDates()

import { useProgressions } from '../../shared/utils/useProgressions'
const { getHabitProgressionReward } = useProgressions()

type AddHabitResult = {
  titleValid: boolean
  tagValid: boolean
  stackValid: boolean
  updatedHabits: Habit[]
}

type EditHabitResult = {
  habitExists: boolean
  titleValid: boolean
  tagValid: boolean
  stackValid: boolean
  updatedHabits: Habit[]
}

type DeleteHabitResult = {
  habitExists: boolean
  updatedHabits: Habit[]
}

type ToggleHabitCompletionResult = {
  habitExists: boolean
  tagExists: Tag | undefined
  updatedHabits: Habit[]
  updatedTags: Tag[]
  updatedUser: User
  levelUp: boolean
  tagLevelUp: boolean
  tagTitle: string
  exp: number
  crystals: number
}

type UpdateAllStreaksResult = {
  updatedHabits: Habit[]
  lostStreaks: number
}

export function useHabits() {
  const addHabit = (addedHabit: Habit, allHabits: Habit[], allTags: Tag[]): AddHabitResult => {
    console.log(addedHabit.tag_id)
    const titleValid = validateTitle(addedHabit.title)
    const tagValid = validateTag(addedHabit.tag_id, allTags)
    const stackValid = validateStack(addedHabit.stack_id)

    if (!titleValid || !tagValid || !stackValid)
      return { titleValid, tagValid, stackValid, updatedHabits: allHabits }

    const nextId = nextID(allHabits)
    const nextPosition = allHabits.length

    const newHabit = {
      id: nextId,
      title: addedHabit.title,
      tag_id: addedHabit.tag_id,
      counter: 0,
      current_streak: 0,
      best_streak: 0,
      stack_id: addedHabit.stack_id,
      position: nextPosition,
      last_month_completed: [],
    }

    const updatedHabits = [...allHabits, newHabit]

    return { titleValid, tagValid, stackValid, updatedHabits }
  }

  const editHabit = (editedHabit: Habit, allHabits: Habit[], allTags: Tag[]): EditHabitResult => {
    const habitExists = validateExistance(editedHabit.id, allHabits)
    const titleValid = validateTitle(editedHabit.title)
    const tagValid = validateTag(editedHabit.tag_id, allTags)
    const stackValid = validateStack(editedHabit.stack_id)

    if (!habitExists || !titleValid || !tagValid || !stackValid)
      return { habitExists, titleValid, tagValid, stackValid, updatedHabits: allHabits }

    const habitToUpdate = habitExists // validation returns habit object if it exists
    const newHabitStack = editedHabit.stack_id
    const oldHabitStack = habitToUpdate.stack_id
    const habitsInOldStack = allHabits.filter((habit) => habit.stack_id === oldHabitStack)
    const habitsInNewStack = allHabits.filter((habit) => habit.stack_id === newHabitStack)

    if (newHabitStack !== oldHabitStack) {
      normalizePositionAfterDeletion(habitsInOldStack, habitToUpdate.position)
      habitToUpdate.position = habitsInNewStack.length
    }

    const updatedHabits = allHabits.map((habit) => {
      if (habit.id === editedHabit.id) {
        return {
          ...habit,
          title: editedHabit.title,
          tag_id: editedHabit.tag_id,
          stack_id: editedHabit.stack_id,
          position: habitToUpdate.position,
        }
      }
      return { ...habit }
    })

    return { habitExists, titleValid, tagValid, stackValid, updatedHabits }
  }

  const deleteHabit = (habitId: number, allHabits: Habit[]): DeleteHabitResult => {
    const habitExists = validateExistance(habitId, allHabits)
    if (!habitExists) return { habitExists, updatedHabits: allHabits }

    // validation returns habit object if it exists
    const habitToDelete = habitExists
    const updatedHabitsPreNormalizing = allHabits.filter((habit) => habit.id !== habitToDelete.id)

    const updatedHabits = updatedHabitsPreNormalizing.map((habit) => {
      if (habit.stack_id === habitToDelete.stack_id && habit.position > habitToDelete.position) {
        return {
          ...habit,
          position: habit.position - 1,
        }
      }
      return { ...habit }
    })

    return { habitExists, updatedHabits }
  }

  const toggleHabitCompletion = (
    toogledHabit: Habit,
    allHabits: Habit[],
    allTags: Tag[],
    user: User,
  ): ToggleHabitCompletionResult => {
    const habitExists = validateExistance(toogledHabit.id, allHabits)
    const tagExists = allTags.find((tag) => tag.id === toogledHabit.tag_id)
    if (!habitExists || !tagExists)
      return {
        habitExists,
        tagExists,
        updatedHabits: allHabits,
        updatedTags: allTags,
        updatedUser: user,
        levelUp: false,
        tagLevelUp: false,
        tagTitle: '',
        exp: 0,
        crystals: 0,
      }

    const today = getToday()
    const habitCheckedToday = toogledHabit.last_month_completed.includes(today)

    const reward = getHabitProgressionReward(toogledHabit)

    let updatedHabit = toogledHabit
    let updatedUser = user
    let updatedTag = tagExists

    const userLvlBefore = user.level
    const tagLvlBefore = tagExists.level

    if (habitCheckedToday) {
      updatedHabit = {
        ...updatedHabit,
        counter: updatedHabit.counter - 1,
        current_streak: updatedHabit.current_streak - 1,
        last_month_completed: updatedHabit.last_month_completed.filter((date) => date !== today),
      }
      updatedUser = {
        ...updatedUser,
        balance: updatedUser.balance - (reward.crystals - 1),
        exp_gained: updatedUser.exp_gained - (reward.exp - 1),
        crystals_gained: updatedUser.crystals_gained - (reward.crystals - 1),
      }

      updatedUser = updateUserLevel(updatedUser, -reward.exp + 1)
      updatedTag = updateTagLevel(updatedTag, -reward.exp + 1)
    } else {
      updatedHabit = {
        ...updatedHabit,
        counter: updatedHabit.counter + 1,
        current_streak: updatedHabit.current_streak + 1,
        best_streak:
          updatedHabit.current_streak > updatedHabit.best_streak
            ? updatedHabit.current_streak
            : updatedHabit.best_streak,
        last_month_completed: [...updatedHabit.last_month_completed, today],
      }
      updatedUser = {
        ...updatedUser,
        balance: updatedUser.balance + reward.crystals,
        exp_gained: updatedUser.exp_gained + reward.exp,
        crystals_gained: updatedUser.crystals_gained + reward.crystals,
        habits_implemented:
          updatedHabit.counter >= 60
            ? updatedUser.habits_implemented + 1
            : updatedUser.habits_implemented,
      }
      updatedUser = updateUserLevel(updatedUser, reward.exp)
      updatedTag = updateTagLevel(updatedTag, reward.exp)
    }

    const updatedHabits = allHabits.map((habit) => {
      if (habit.id === updatedHabit.id) {
        return {
          ...habit,
          counter: updatedHabit.counter,
          current_streak: updatedHabit.current_streak,
          best_streak: updatedHabit.best_streak,
          last_month_completed: updatedHabit.last_month_completed,
        }
      }
      return { ...habit }
    })

    const updatedTags = allTags.map((tag) => {
      if (tag.id === updatedTag.id) {
        return {
          ...tag,
          level: updatedTag.level,
          exp_current: updatedTag.exp_current,
          exp_needed: updatedTag.exp_needed,
        }
      }
      return { ...tag }
    })

    // check if user leveled up
    let levelUp = false
    if (userLvlBefore < updatedUser.level) {
      levelUp = true
    }

    // check if tag leveled up
    let tagLevelUp = false
    if (tagLvlBefore < updatedTag.level) {
      tagLevelUp = true
    }

    return {
      habitExists,
      tagExists,
      updatedHabits,
      updatedTags,
      updatedUser,
      levelUp,
      tagLevelUp,
      tagTitle: updatedTag.title,
      exp: reward.exp,
      crystals: reward.crystals,
    }
  }

  const updateAllStreaks = (allHabits: Habit[]): UpdateAllStreaksResult => {
    const today = getToday()
    const yesterday = getYesterday()

    let lostStreaks = 0
    const updatedHabits = allHabits.map((habit) => {
      if (
        !habit.last_month_completed.includes(today) &&
        !habit.last_month_completed.includes(yesterday) &&
        habit.current_streak > 0
      ) {
        lostStreaks++
        return {
          ...habit,
          current_streak: 0,
        }
      }
      return { ...habit }
    })

    return { updatedHabits, lostStreaks }
  }

  return {
    addHabit,
    editHabit,
    deleteHabit,
    toggleHabitCompletion,
    updateAllStreaks,
  }
}
