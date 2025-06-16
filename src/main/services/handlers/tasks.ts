import { ipcMain } from 'electron'
import db from '../../db/lowdb.js'
import { IPC_CHANNELS } from '../channels'
import { Task } from '../../db/types'

import { getDates } from '../../helpers/getDates.js'
const { getToday } = getDates()

import { normalizePositionAfterDeletion } from '../../helpers/positionNormalizer.js'

export function registerTaskHandlers() {
  ipcMain.handle(IPC_CHANNELS.GET_TASKS, () => db.data.tasks)

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

  ipcMain.handle(IPC_CHANNELS.DELETE_TASK, (event, id: number) => {
    db.read()
    const index = db.data.tasks.findIndex((task) => task.id === id)
    if (index === -1) return { success: false, message: 'Task not found' }

    const tasks = db.data.tasks
    const taskToDelete = tasks[index]
    const taskToDeleteQuest = taskToDelete.quest_id
    const tasksInSameQuest = tasks.filter((task) => task.quest_id === taskToDeleteQuest)

    tasks.splice(index, 1)
    normalizePositionAfterDeletion(tasksInSameQuest, taskToDelete.position)

    db.write()
    event.sender.send(IPC_CHANNELS.TASKS_UPDATED)
    event.sender.send(IPC_CHANNELS.QUESTS_UPDATED)
    event.sender.send(IPC_CHANNELS.QUESTLINES_UPDATED)
    return { success: true, message: 'Task deleted!' }
  })

  ipcMain.handle(IPC_CHANNELS.TOGGLE_TASK_COMPLETION, (event, task: Task) => {
    db.read()
    const dbTask = db.data.tasks.find((t) => t.id === task.id)
    if (!dbTask) return { success: false, message: 'Task not found' }

    dbTask.completed = !dbTask.completed

    if (dbTask.completed) {
      db.data.user.todos_done += 1
    } else {
      db.data.user.todos_done -= 1
    }

    db.write()

    event.sender.send(IPC_CHANNELS.TASKS_UPDATED)
    event.sender.send(IPC_CHANNELS.QUESTS_UPDATED)
    event.sender.send(IPC_CHANNELS.QUESTLINES_UPDATED)
    return { success: true }
  })
}
