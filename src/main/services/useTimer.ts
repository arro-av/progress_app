import { User, Questline, Quest, Tag } from '../db/types'

import { useProgressions } from '../../shared/utils/useProgressions'
const { getTimeProgressionReward } = useProgressions()

import { updateLevels } from '../helpers/updateLevels'
const { updateUserLevel, updateTagLevel } = updateLevels()

type AddTimeResult = {
  success: boolean
  message?: string
  updatedUser: User
  updatedQuestlines: Questline[]
  updatedQuests: Quest[]
  updatedTags: Tag[]
  levelUp: boolean
  tagLevelUps: string[]
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
    const currentActiveQuest = currentActiveQuestline
      ? allQuests.find((quest) => quest.questline_id === currentActiveQuestline.id && quest.active)
      : null

    if (!currentActiveQuestline || !currentActiveQuest) {
      return {
        success: false,
        message: 'Select an active project and epic first',
        updatedUser: user,
        updatedQuestlines: allQuestlines,
        updatedQuests: allQuests,
        updatedTags: allTags,
        levelUp: false,
        tagLevelUps: [],
        userExp: 0,
        tagExp: 0,
      }
    }

    const roundedTimeSpent = Math.floor(timeSpentMinutes)

    if (roundedTimeSpent <= 0) {
      return {
        success: true,
        message: 'No time tracked yet',
        updatedUser: user,
        updatedQuestlines: allQuestlines,
        updatedQuests: allQuests,
        updatedTags: allTags,
        levelUp: false,
        tagLevelUps: [],
        userExp: 0,
        tagExp: 0,
      }
    }

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

    const preUpdatedUserLevel = user.level
    const tagLevelsBefore = new Map<number, number>()
    const updatedTagMap = new Map<number, Tag>()

    if (currentActiveQuest) {
      const affectedTags = allTags.filter(
        (tag) => tag.id === currentActiveQuest.tag_id_1 || tag.id === currentActiveQuest.tag_id_2,
      )

      affectedTags.forEach((tag) => {
        tagLevelsBefore.set(tag.id, tag.level)
        updatedTagMap.set(tag.id, updateTagLevel(tag, reward.tagExp))
      })

      updatedTags = allTags.map((tag) => {
        const updatedTag = updatedTagMap.get(tag.id)
        if (updatedTag) {
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

    const tagLevelUps = updatedTags
      .filter((tag) => updatedTagMap.has(tag.id))
      .filter((tag) => (tagLevelsBefore.get(tag.id) ?? tag.level) < tag.level)
      .map((tag) => tag.title)

    return {
      success: true,
      updatedUser,
      updatedQuestlines,
      updatedQuests,
      updatedTags,
      levelUp,
      tagLevelUps,
      userExp: reward.userExp,
      tagExp: reward.tagExp,
    }
  }

  return {
    addTime,
  }
}
