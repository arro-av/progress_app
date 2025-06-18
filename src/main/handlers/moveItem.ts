import { ipcMain } from 'electron'
import db from '../db/lowdb.js'
import { IPC_CHANNELS } from '../channels.js'
import { Reward, Habit, Tag, Idea, HabitStack, Quest, Task } from '../db/types.ts'

export function registerMoveItemHandler() {
  ipcMain.handle(
    IPC_CHANNELS.MOVE_ITEM,
    (
      event,
      passedItem: Reward | Habit | Idea | Tag | HabitStack | Quest | Task,
      type:
        | 'rewards'
        | 'habits'
        | 'ideas'
        | 'tags'
        | 'habit_stacks'
        | 'questlines'
        | 'quests'
        | 'tasks',
      direction: 'up' | 'down',
    ) => {
      db.read()
      const items = db.data[type]
      const itemToMoveIndex = items.findIndex((item) => item.id === passedItem.id)

      if (itemToMoveIndex === -1)
        return {
          success: false,
          message: `${type.charAt(0).toUpperCase() + type.slice(1)} not found`,
        }
      if (direction !== 'up' && direction !== 'down')
        return { success: false, message: 'No valid Direction specified' }

      if (type !== 'habits' && type !== 'tasks' && type !== 'quests') {
        const itemToMove = items[itemToMoveIndex]
        const currentPosition = itemToMove.position

        // Already at TOP
        if (currentPosition === 0 && direction === 'up')
          return {
            success: false,
            message: `${type.charAt(0).toUpperCase() + type.slice(1, -1)} already placed first.`,
          }
        // Already at BOTTOM
        if (currentPosition === items.length - 1 && direction === 'down')
          return {
            success: false,
            message: `${type.charAt(0).toUpperCase() + type.slice(1, -1)} already placed last.`,
          }

        const newPosition = direction === 'up' ? currentPosition - 1 : currentPosition + 1
        const itemToSwapIndex = items.findIndex((item) => item.position === newPosition)
        const itemToSwap = items[itemToSwapIndex]

        itemToSwap.position = currentPosition
        itemToMove.position = newPosition
      }

      if (type === 'habits') {
        const habits = db.data.habits
        const habitToMove = habits[itemToMoveIndex]
        const habitToMoveStack = habitToMove.stack_id
        const habitsInSameStack = habits.filter((habit) => habit.stack_id === habitToMoveStack)

        const currentPosition = habitToMove.position

        // Already at TOP
        if (currentPosition === 0 && direction === 'up')
          return {
            success: false,
            message: `${type.charAt(0).toUpperCase() + type.slice(1, -1)} already placed first.`,
          }
        // Already at BOTTOM
        if (currentPosition === habitsInSameStack.length - 1 && direction === 'down')
          return {
            success: false,
            message: `${type.charAt(0).toUpperCase() + type.slice(1, -1)} already placed last.`,
          }

        const newPosition = direction === 'up' ? currentPosition - 1 : currentPosition + 1
        const habitToSwapIndex = habitsInSameStack.findIndex(
          (habit) => habit.position === newPosition,
        )
        const habitToSwap = habitsInSameStack[habitToSwapIndex]

        habitToSwap.position = currentPosition
        habitToMove.position = newPosition
      }

      if (type === 'tasks') {
        const tasks = db.data.tasks
        const taskToMove = tasks[itemToMoveIndex]
        const taskToMoveQuest = taskToMove.quest_id
        const tasksInSameQuest = tasks.filter((task) => task.quest_id === taskToMoveQuest)

        const currentPosition = taskToMove.position

        // Already at TOP
        if (currentPosition === 0 && direction === 'up')
          return {
            success: false,
            message: `${type.charAt(0).toUpperCase() + type.slice(1, -1)} already placed first.`,
          }
        // Already at BOTTOM
        if (currentPosition === tasksInSameQuest.length - 1 && direction === 'down')
          return {
            success: false,
            message: `${type.charAt(0).toUpperCase() + type.slice(1, -1)} already placed last.`,
          }

        const newPosition = direction === 'up' ? currentPosition - 1 : currentPosition + 1
        const taskToSwapIndex = tasksInSameQuest.findIndex((task) => task.position === newPosition)
        const taskToSwap = tasksInSameQuest[taskToSwapIndex]

        taskToSwap.position = currentPosition
        taskToMove.position = newPosition
      }

      if (type === 'quests') {
        const quests = db.data.quests
        const questToMove = quests[itemToMoveIndex]
        const questToMoveQuestline = questToMove.questline_id
        const questsInSameQuestline = quests.filter(
          (quest) => quest.questline_id === questToMoveQuestline,
        )

        const currentPosition = questToMove.position

        // Already at TOP
        if (currentPosition === 0 && direction === 'up')
          return {
            success: false,
            message: `${type.charAt(0).toUpperCase() + type.slice(1, -1)} already placed first.`,
          }
        // Already at BOTTOM
        if (currentPosition === questsInSameQuestline.length - 1 && direction === 'down')
          return {
            success: false,
            message: `${type.charAt(0).toUpperCase() + type.slice(1, -1)} already placed last.`,
          }

        const newPosition = direction === 'up' ? currentPosition - 1 : currentPosition + 1
        const questToSwapIndex = questsInSameQuestline.findIndex(
          (quest) => quest.position === newPosition,
        )
        const questToSwap = questsInSameQuestline[questToSwapIndex]

        questToSwap.position = currentPosition
        questToMove.position = newPosition
      }

      db.write()
      event.sender.send(IPC_CHANNELS[type.toUpperCase() + '_UPDATED'])
      return {
        success: true,
        message: `${type.charAt(0).toUpperCase() + type.slice(1, -1)} moved!`,
      }
    },
  )
}
