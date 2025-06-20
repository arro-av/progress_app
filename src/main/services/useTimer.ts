import { BrowserWindow } from 'electron'
import { IPC_CHANNELS } from '../channels'
import db from '../db/lowdb.js'

import { User, Questline, Quest } from '../db/types'

type AddTimeResult = {
  success: boolean
  updatedUser: User
  updatedQuestlines: Questline[]
  updatedQuests: Quest[]
}

export function useTimer() {
  // Extract the addTime logic to a separate function
  const addTime = (
    timeSpentMinutes: number,
    user: User,
    allQuestlines: Questline[],
    allQuests: Quest[],
  ): AddTimeResult => {
    const currentActiveQuestline = allQuestlines.find((questline) => questline.active)
    const currentActiveQuest = allQuests.find(
      (quest) => quest.questline_id === currentActiveQuestline!.id && quest.active,
    )

    const roundedTimeSpent = Math.round(timeSpentMinutes)

    let updatedUser = user
    updatedUser.pomodoros += 1
    updatedUser.focused_time += roundedTimeSpent

    let updatedQuestlines = allQuestlines
    if (currentActiveQuestline) {
      updatedQuestlines = allQuestlines.map((questline) => {
        if (questline.active) {
          return {
            ...questline,
            time_spent: questline.time_spent + roundedTimeSpent,
          }
        }
        return { ...questline }
      })
    }

    let updatedQuests = allQuests
    if (currentActiveQuest) {
      updatedQuests = allQuests.map((quest) => {
        if (quest.id === currentActiveQuest.id) {
          return {
            ...quest,
            time_spent: quest.time_spent + roundedTimeSpent,
          }
        }
        return { ...quest }
      })
    }

    return {
      success: true,
      updatedUser,
      updatedQuestlines,
      updatedQuests,
    }
  }

  return {
    addTime,
  }
}
