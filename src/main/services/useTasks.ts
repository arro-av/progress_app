import { nextID } from '../helpers/nextID'
import { Task } from '../db/types'

import { normalizePositionAfterDeletion } from '../helpers/positionNormalizer'
import { useValidations } from '../helpers/useValidations'
const { validateExistance, validateTitle, validateTag, validateStack } = useValidations()

import { updateLevels } from '../helpers/updateLevels'
const { updateUserLevel, updateTagLevel } = updateLevels()

import { getDates } from '../helpers/getDates'
const { getToday, getYesterday } = getDates()

import { useProgressions } from '../../shared/utils/useProgressions'
const { getHabitProgressionReward } = useProgressions()

type AddTaskResult = {
  titleValid: boolean
  updatedTasks: Task[]
}

type EditTaskResult = {
  taskExists: boolean
  titleValid: boolean
  updatedTasks: Task[]
}

type DeleteTaskResult = {
  taskExists: boolean
  updatedTasks: Task[]
}

type ToggleTaskCompletionResult = {
  taskExists: boolean
  updatedTasks: Task[]
  updatedTodosDone: number
}

export function useTasks() {
  const addTask = (addedTask: Task, allTasks: Task[]): AddTaskResult => {
    console.log(addedTask.quest_id)
    const titleValid = validateTitle(addedTask.title)

    if (!titleValid) return { titleValid, updatedTasks: allTasks }

    const nextId = nextID(allTasks)
    const nextPosition = allTasks.length

    const newTask = {
      id: nextId,
      title: addedTask.title,
      quest_id: addedTask.quest_id,
      completed: false,
      position: nextPosition,
    }

    const updatedTasks = [...allTasks, newTask]

    return { titleValid, updatedTasks }
  }

  const editTask = (editedTask: Task, allTasks: Task[]): EditTaskResult => {
    const taskExists = validateExistance(editedTask.id, allTasks)
    const titleValid = validateTitle(editedTask.title)

    if (!taskExists || !titleValid) return { taskExists, titleValid, updatedTasks: allTasks }

    const taskToUpdate = taskExists // validation returns task object if it exists
    const newTaskQuestID = editedTask.quest_id
    const oldTaskQuestID = taskToUpdate.quest_id
    const tasksInOldQuest = allTasks.filter((task) => task.quest_id === oldTaskQuestID)
    const tasksInNewQuest = allTasks.filter((task) => task.quest_id === newTaskQuestID)

    if (newTaskQuestID !== oldTaskQuestID) {
      normalizePositionAfterDeletion(tasksInOldQuest, taskToUpdate.position)
      taskToUpdate.position = tasksInNewQuest.length
    }

    const updatedTasks = allTasks.map((task) => {
      if (task.id === editedTask.id) {
        return {
          ...task,
          title: editedTask.title,
          quest_id: editedTask.quest_id,
          position: taskToUpdate.position,
        }
      }
      return { ...task }
    })

    return { taskExists, titleValid, updatedTasks }
  }

  const deleteTask = (taskId: number, allTasks: Task[]): DeleteTaskResult => {
    const taskExists = validateExistance(taskId, allTasks)
    if (!taskExists) return { taskExists, updatedTasks: allTasks }

    // validation returns task object if it exists
    const taskToDelete = taskExists
    const updatedTasksPreNormalizing = allTasks.filter((task) => task.id !== taskToDelete.id)

    const updatedTasks = updatedTasksPreNormalizing.map((task) => {
      if (task.quest_id === taskToDelete.quest_id && task.position > taskToDelete.position) {
        return {
          ...task,
          position: task.position - 1,
        }
      }
      return { ...task }
    })

    return { taskExists, updatedTasks }
  }

  const toggleTaskCompletion = (
    toogledTask: Task,
    allTasks: Task[],
    allTodosDone: number,
  ): ToggleTaskCompletionResult => {
    const taskExists = validateExistance(toogledTask.id, allTasks)
    if (!taskExists)
      return {
        taskExists,
        updatedTasks: allTasks,
        updatedTodosDone: allTodosDone,
      }

    const updatedTasks = allTasks.map((task) => {
      if (task.id === toogledTask.id) {
        return {
          ...task,
          completed: !task.completed,
        }
      }
      return { ...task }
    })

    const updatedTodosDone = allTodosDone + (toogledTask.completed ? -1 : 1)

    return {
      taskExists,
      updatedTasks,
      updatedTodosDone,
    }
  }

  return {
    addTask,
    editTask,
    deleteTask,
    toggleTaskCompletion,
  }
}
