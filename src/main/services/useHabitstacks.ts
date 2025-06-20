import { nextID } from '../helpers/nextID'
import { HabitStack, Habit } from '../db/types'

import { normalizePositionAfterDeletion } from '../helpers/positionNormalizer'
import { useValidations } from '../helpers/useValidations'
const { validateExistance, validateTitle } = useValidations()

type AddHabitStackResult = {
  titleValid: boolean
  updatedHabitStacks: HabitStack[]
}

type EditHabitStackResult = {
  stackExists: boolean
  titleValid: boolean
  updatedHabitStacks: HabitStack[]
}

type DeleteHabitStackResult = {
  stackExists: boolean
  updatedHabitStacks: HabitStack[]
  stillHabitsInStack: boolean
}

export function useHabitstacks() {
  const addHabitStack = (addedStack: HabitStack, allStacks: HabitStack[]): AddHabitStackResult => {
    const titleValid = validateTitle(addedStack.title)

    if (!titleValid) return { titleValid, updatedHabitStacks: allStacks }

    const nextId = nextID(allStacks)
    const nextPosition = allStacks.length

    const newHabitStack = {
      id: nextId,
      title: addedStack.title,
      position: nextPosition,
    }

    const updatedHabitStacks = [...allStacks, newHabitStack]

    return { titleValid, updatedHabitStacks }
  }

  const editHabitStack = (
    editedStack: HabitStack,
    allStacks: HabitStack[],
  ): EditHabitStackResult => {
    const stackExists = validateExistance(editedStack.id, allStacks)
    const titleValid = validateTitle(editedStack.title)

    if (!stackExists || !titleValid)
      return { stackExists, titleValid, updatedHabitStacks: allStacks }

    const updatedHabitStacks = allStacks.map((stack) => {
      if (stack.id === editedStack.id) {
        return {
          ...stack,
          title: editedStack.title,
        }
      }
      return { ...stack }
    })

    return { stackExists, titleValid, updatedHabitStacks }
  }

  const deleteHabitStack = (
    stackId: number,
    allStacks: HabitStack[],
    allHabits: Habit[],
  ): DeleteHabitStackResult => {
    const stackExists = validateExistance(stackId, allStacks)
    if (!stackExists)
      return { stackExists, updatedHabitStacks: allStacks, stillHabitsInStack: false }

    const habitsInStack = allHabits.filter((habit) => habit.stack_id === stackId)
    if (habitsInStack.length > 0) {
      return {
        stackExists,
        updatedHabitStacks: allStacks,
        stillHabitsInStack: true,
      }
    }
    // validation returns habitstack object if it exists
    const stackToDelete = stackExists
    const updatedHabitStacksPreNormalizing = allStacks.filter(
      (stack) => stack.id !== stackToDelete.id,
    )

    const updatedHabitStacksNormalized = normalizePositionAfterDeletion(
      updatedHabitStacksPreNormalizing,
      stackToDelete.position,
    )

    const updatedHabitStacks = updatedHabitStacksNormalized

    return { stackExists, updatedHabitStacks, stillHabitsInStack: false }
  }

  return {
    addHabitStack,
    editHabitStack,
    deleteHabitStack,
  }
}
