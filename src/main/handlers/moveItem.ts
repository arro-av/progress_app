import { ipcMain } from 'electron'
import db from '../db/lowdb.js'
import { IPC_CHANNELS } from '../channels.js'

import { Reward, Habit, Tag, Idea, HabitStack, Quest, Task } from '../db/types.ts'
import { useGlobals } from '../services/useGlobals'
const { updateItemPositions } = useGlobals()

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

      let result: any
      switch (type) {
        case 'rewards':
          const rewardItem = passedItem as Reward
          result = updateItemPositions(rewardItem, db.data.rewards, db.data.rewards, direction)
          break
        case 'habits':
          const habitItem = passedItem as Habit
          const habitsInStack = db.data.habits.filter(
            (habit) => habit.stack_id === habitItem.stack_id,
          )
          result = updateItemPositions(habitItem, habitsInStack, db.data.habits, direction)
          break
        case 'ideas':
          const ideaItem = passedItem as Idea
          result = updateItemPositions(ideaItem, db.data.ideas, db.data.ideas, direction)
          break
        case 'tags':
          const tagItem = passedItem as Tag
          result = updateItemPositions(tagItem, db.data.tags, db.data.tags, direction)
          break
        case 'habit_stacks':
          const stackItem = passedItem as HabitStack
          result = updateItemPositions(
            stackItem,
            db.data.habit_stacks,
            db.data.habit_stacks,
            direction,
          )
          break
        case 'questlines':
          const questlineItem = passedItem as Quest
          result = updateItemPositions(
            questlineItem,
            db.data.questlines,
            db.data.questlines,
            direction,
          )
          break
        case 'quests':
          const questItem = passedItem as Quest
          const questsInQuestline = db.data.quests.filter(
            (quest) => quest.questline_id === questItem.questline_id,
          )
          result = updateItemPositions(questItem, questsInQuestline, db.data.quests, direction)
          break
        case 'tasks':
          const taskItem = passedItem as Task
          const tasksInQuests = db.data.tasks.filter((task) => task.quest_id === taskItem.quest_id)
          result = updateItemPositions(taskItem, tasksInQuests, db.data.tasks, direction)
          break
        default:
          return { success: false, message: 'No valid Type specified' }
      }
      if (!result.itemExists) return { success: false, message: 'Item not found' }
      if (!result.directionValid) return { success: false, message: 'No valid Direction specified' }
      if (result.atTop) return { success: false, message: 'Already placed first' }
      if (result.atBottom) return { success: false, message: 'Already placed last' }

      db.data[type] = result.updatedItems
      db.write()

      event.sender.send(IPC_CHANNELS[type.toUpperCase() + '_UPDATED'])
      return {
        success: true,
        message: `${type.charAt(0).toUpperCase() + type.slice(1, -1)} moved!`,
      }
    },
  )
}
