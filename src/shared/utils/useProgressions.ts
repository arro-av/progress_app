import { Habit, Quest, Questline, Task } from '../../main/db/types'
import { useRanks } from '../helpers/useRanks'

const { getHabitRank } = useRanks()

// define return types
type HabitProgressionReward = {
  exp: number
  crystals: number
}

type QuestProgressionReward = {
  crystals: number
  tagExp: number
  userExp: number
}

type QuestlineProgressionReward = {
  crystals: number
  userExp: number
}

export const useProgressions = () => {
  const getHabitProgressionReward = (habit: Habit): HabitProgressionReward => {
    const habitRank = getHabitRank(habit)

    switch (habitRank) {
      case 'common':
        return {
          exp: 10 + habit.current_streak,
          crystals: 1 + habit.current_streak,
        }
      case 'uncommon':
        return {
          exp: 20 + habit.current_streak,
          crystals: 2 + habit.current_streak,
        }
      case 'rare':
        return {
          exp: 30 + habit.current_streak,
          crystals: 3 + habit.current_streak,
        }
      case 'epic':
        return {
          exp: 40 + habit.current_streak,
          crystals: 4 + habit.current_streak,
        }
      case 'legendary':
        return {
          exp: 50 + habit.current_streak,
          crystals: 5 + habit.current_streak,
        }
      default:
        return {
          exp: 0,
          crystals: 0,
        }
    }
  }

  const getQuestProgressionReward = (
    quest: Quest,
    tasksInQuest: Task[],
  ): QuestProgressionReward => {
    return {
      crystals: Math.round(tasksInQuest.length + quest.time_spent / 10),
      tagExp: Math.round(tasksInQuest.length * 10 + quest.time_spent / 2),
      userExp: Math.round(tasksInQuest.length * 15 + quest.time_spent / 1.35),
    }
  }

  const getQuestlineProgressionReward = (questline: Questline): QuestlineProgressionReward => {
    return {
      crystals: Math.round(questline.time_spent / 10),
      userExp: Math.round(questline.time_spent / 1.35),
    }
  }

  return {
    getHabitProgressionReward,
    getQuestProgressionReward,
    getQuestlineProgressionReward,
  }
}
