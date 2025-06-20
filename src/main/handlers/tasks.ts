import { ipcMain } from 'electron'
import db from '../db/lowdb.js'
import { IPC_CHANNELS } from '../channels'

import { Task } from '../db/types'
import { useTasks } from '../services/useTasks'
const { addTask, editTask, deleteTask, toggleTaskCompletion } = useTasks()

export function registerTaskHandlers() {
  ipcMain.handle(IPC_CHANNELS.GET_TASKS, () => db.data.tasks)

  ipcMain.handle(IPC_CHANNELS.ADD_TASK, (event, addedTask: Task) => {
    db.read()
    const result = addTask(addedTask, db.data.tasks)
    if (!result.titleValid) return { success: false, message: 'Title is required' }

    db.data.tasks = result.updatedTasks
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
    const result = editTask(editedTask, db.data.tasks)
    if (!result.taskExists || !result.titleValid)
      return { success: false, message: 'Task not found' }

    db.data.tasks = result.updatedTasks
    db.write()

    event.sender.send(IPC_CHANNELS.TASKS_UPDATED)
    event.sender.send(IPC_CHANNELS.QUESTS_UPDATED)
    event.sender.send(IPC_CHANNELS.QUESTLINES_UPDATED)
    return { success: true, message: 'Task updated!' }
  })

  ipcMain.handle(IPC_CHANNELS.DELETE_TASK, (event, id: number) => {
    db.read()
    const result = deleteTask(id, db.data.tasks)
    if (!result.taskExists) return { success: false, message: 'Task not found' }

    db.data.tasks = result.updatedTasks
    db.write()

    event.sender.send(IPC_CHANNELS.TASKS_UPDATED)
    event.sender.send(IPC_CHANNELS.QUESTS_UPDATED)
    event.sender.send(IPC_CHANNELS.QUESTLINES_UPDATED)
    return { success: true, message: 'Task deleted!' }
  })

  ipcMain.handle(IPC_CHANNELS.TOGGLE_TASK_COMPLETION, (event, task: Task) => {
    db.read()
    const result = toggleTaskCompletion(task, db.data.tasks, db.data.user.todos_done)
    if (!result.taskExists) return { success: false, message: 'Task not found' }

    db.data.tasks = result.updatedTasks
    db.data.user.todos_done = result.updatedTodosDone
    db.write()

    event.sender.send(IPC_CHANNELS.TASKS_UPDATED)
    event.sender.send(IPC_CHANNELS.QUESTS_UPDATED)
    event.sender.send(IPC_CHANNELS.QUESTLINES_UPDATED)
    return { success: true }
  })
}
