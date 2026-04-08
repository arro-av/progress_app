import { Quest, Questline, Task } from '../../main/db/types'

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
      crystals: Math.round(quest.time_spent / 45),
      tagExp: Math.round(quest.time_spent * 0.17),
      userExp: Math.round(quest.time_spent * 0.24),
    }
  }

  const getQuestlineProgressionReward = (questline: Questline): QuestlineProgressionReward => {
    return {
      crystals: Math.round(questline.time_spent / 6),
      userExp: Math.round(questline.time_spent * 0.54),
    }
  }

  const getTimeProgressionReward = (timeSpentMinutes: number): TimeProgressionReward => {
    return {
      tagExp: Math.round(timeSpentMinutes * 0.43),
      userExp: Math.round(timeSpentMinutes * 0.2),
    }
  }

  return {
    getQuestProgressionReward,
    getQuestlineProgressionReward,
    getTimeProgressionReward,
  }
}
