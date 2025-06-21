import { User, Questline, Quest, Tag } from '../db/types'

import { useProgressions } from '../../shared/utils/useProgressions'
const { getTimeProgressionReward } = useProgressions()

import { updateLevels } from '../helpers/updateLevels'
const { updateUserLevel, updateTagLevel } = updateLevels()

type AddTimeResult = {
  success: boolean
  updatedUser: User
  updatedQuestlines: Questline[]
  updatedQuests: Quest[]
  updatedTags: Tag[]
  levelUp: boolean
  tagLevelUp: boolean
  tagTitle: string
  userExp: number
  tagExp: number
}

export function useTimer() {
  // Extract the addTime logic to a separate function
  const addTime = (
    timeSpentMinutes: number,
    user: User,
    allQuestlines: Questline[],
    allQuests: Quest[],
    allTags: Tag[],
  ): AddTimeResult => {
    const currentActiveQuestline = allQuestlines.find((questline) => questline.active)
    const currentActiveQuest = allQuests.find(
      (quest) => quest.questline_id === currentActiveQuestline!.id && quest.active,
    )

    const roundedTimeSpent = Math.round(timeSpentMinutes)

    const reward = getTimeProgressionReward(roundedTimeSpent)

    let updatedUser = user
    updatedUser.pomodoros += 1
    updatedUser.focused_time += roundedTimeSpent
    updatedUser.exp_gained += reward.userExp

    updatedUser = updateUserLevel(updatedUser, reward.userExp)

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

    let updatedTags = allTags
    let updatedTag: Tag | undefined

    const preUpdatedUserLevel = user.level
    let preUpdatedTagLevel = updatedTag?.level

    if (currentActiveQuest) {
      updatedTag = allTags.find((tag) => tag.id === currentActiveQuest.tag_id)
      if (updatedTag) {
        updatedTag = updateTagLevel(updatedTag, reward.tagExp)
        preUpdatedTagLevel = updatedTag.level
      }

      updatedTags = allTags.map((tag) => {
        if (updatedTag && tag.id === updatedTag.id) {
          return {
            ...tag,
            time_spent: tag.time_spent + roundedTimeSpent,
            level: updatedTag.level,
            exp_current: updatedTag.exp_current,
            exp_needed: updatedTag.exp_needed,
          }
        }
        return { ...tag }
      })
    }

    let levelUp = false
    if (preUpdatedUserLevel < updatedUser.level) levelUp = true

    let tagLevelUp = false
    if (updatedTag && preUpdatedTagLevel && preUpdatedTagLevel < updatedTag.level) tagLevelUp = true

    return {
      success: true,
      updatedUser,
      updatedQuestlines,
      updatedQuests,
      updatedTags,
      levelUp,
      tagLevelUp,
      tagTitle: updatedTag?.title || '',
      userExp: reward.userExp,
      tagExp: reward.tagExp,
    }
  }

  return {
    addTime,
  }
}
