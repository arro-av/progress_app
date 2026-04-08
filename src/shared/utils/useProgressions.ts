import { Quest, Questline, Task } from '../../main/db/types'

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

type TimeProgressionReward = {
  tagExp: number
  userExp: number
}

export const useProgressions = () => {
  const getQuestProgressionReward = (
    quest: Quest,
    tasksInQuest: Task[],
  ): QuestProgressionReward => {
    return {
      crystals: Math.round(tasksInQuest.length + quest.time_spent / 10),
      tagExp: Math.round(tasksInQuest.length * 10 + quest.time_spent / 2),
      userExp: Math.round(tasksInQuest.length * 10 + quest.time_spent / 1.25),
    }
  }

  const getQuestlineProgressionReward = (questline: Questline): QuestlineProgressionReward => {
    return {
      crystals: Math.round(questline.time_spent / 10),
      userExp: Math.round(questline.time_spent / 1.25),
    }
  }

  const getTimeProgressionReward = (timeSpentMinutes: number): TimeProgressionReward => {
    return {
      tagExp: Math.round(timeSpentMinutes / 4),
      userExp: Math.round(timeSpentMinutes / 2),
    }
  }

  return {
    getQuestProgressionReward,
    getQuestlineProgressionReward,
    getTimeProgressionReward,
  }
}
