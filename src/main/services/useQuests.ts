import { nextID } from '../helpers/nextID'
import { Tag, Quest, Task, User } from '../db/types'

import { normalizePositionAfterDeletion } from '../helpers/positionNormalizer'
import { useValidations } from '../helpers/useValidations'
const { validateExistance, validateTitle, validateTag } = useValidations()

import { updateLevels } from '../helpers/updateLevels'
const { updateUserLevel, updateTagLevel } = updateLevels()

import { useProgressions } from '../../shared/utils/useProgressions'
const { getQuestProgressionReward } = useProgressions()

type AddQuestResult = {
  titleValid: boolean
  tagValid: boolean
  updatedQuests: Quest[]
}

type EditQuestResult = {
  questExists: boolean
  titleValid: boolean
  tagValid: boolean
  updatedQuests: Quest[]
}

type DeleteQuestResult = {
  questExists: boolean
  updatedQuests: Quest[]
  updatedTasks: Task[]
}

type ActivateQuestResult = {
  questExists: boolean
  updatedQuests: Quest[]
  alreadyActive: boolean
}

type ClaimQuestRewardResult = {
  questExists: boolean
  updatedUser: User
  updatedQuests: Quest[]
  updatedTags: Tag[]
  notCompleted: boolean
  crystalsGained: number
  userExpGained: number
  tagExpGained: number
  tagTitle: string
  levelUp: boolean
  tagLevelUp: boolean
}

export function useQuests() {
  const addQuest = (addedQuest: Quest, allQuests: Quest[], allTags: Tag[]): AddQuestResult => {
    const titleValid = validateTitle(addedQuest.title)
    const tagValid = validateTag(addedQuest.tag_id, allTags)
    if (!titleValid || !tagValid) return { titleValid, tagValid, updatedQuests: allQuests }

    const nextId = nextID(allQuests)
    const nextPosition = allQuests.length

    const newQuest = {
      ...addedQuest,
      id: nextId,
      title: addedQuest.title,
      time_spent: 0,
      questline_id: addedQuest.questline_id,
      tag_id: addedQuest.tag_id,
      active: false,
      position: nextPosition,
    }

    const updatedQuests = [...allQuests, newQuest]

    console.log(updatedQuests)

    return { titleValid, tagValid, updatedQuests }
  }

  const editQuest = (editedQuest: Quest, allQuests: Quest[], allTags: Tag[]): EditQuestResult => {
    const questExists = validateExistance(editedQuest.id, allQuests)
    const titleValid = validateTitle(editedQuest.title)
    const tagValid = validateTag(editedQuest.tag_id, allTags)

    if (!questExists || !titleValid || !tagValid)
      return { questExists, titleValid, tagValid, updatedQuests: allQuests }

    const updatedQuests = allQuests.map((quest) => {
      if (quest.id === editedQuest.id) {
        return {
          ...quest,
          title: editedQuest.title,
          tag_id: editedQuest.tag_id,
        }
      }
      return { ...quest }
    })

    return { questExists, titleValid, tagValid, updatedQuests }
  }

  const deleteQuest = (
    questId: number,
    allQuests: Quest[],
    allTasks: Task[],
  ): DeleteQuestResult => {
    const questExists = validateExistance(questId, allQuests)
    if (!questExists)
      return {
        questExists,
        updatedQuests: allQuests,
        updatedTasks: allTasks,
      }

    const updatedTasks = allTasks.filter((task) => task.quest_id !== questId)
    console.log(updatedTasks)

    // validation returns questline object if it exists
    const questToDelete = questExists
    const updatedQuestsPreNormalizing = allQuests.filter((quest) => quest.id !== questToDelete.id)

    const updatedQuestsPreReactivation = normalizePositionAfterDeletion(
      updatedQuestsPreNormalizing,
      questToDelete.position,
    )

    const questsInQuestline = updatedQuestsPreReactivation.filter(
      (quest) => quest.questline_id === questToDelete.questline_id,
    )

    let updatedQuests = updatedQuestsPreReactivation
    if (questsInQuestline.length > 0) {
      const questToActivate = updatedQuestsPreReactivation[0]
      updatedQuests = activateQuest(questToActivate, updatedQuestsPreReactivation).updatedQuests
    }

    return { questExists, updatedQuests, updatedTasks }
  }

  const activateQuest = (activatedQuest: Quest, allQuests: Quest[]): ActivateQuestResult => {
    const questExists = validateExistance(activatedQuest.id, allQuests)
    if (!questExists) return { questExists, updatedQuests: allQuests, alreadyActive: false }

    if (activatedQuest.active) return { questExists, updatedQuests: allQuests, alreadyActive: true }

    const questsInQuestline = allQuests.filter(
      (quest) => quest.questline_id === activatedQuest.questline_id,
    )
    const updatedQuests = allQuests.map((quest) => {
      if (quest.id === activatedQuest.id) {
        return {
          ...quest,
          active: true,
        }
      }
      if (questsInQuestline.includes(quest)) {
        return {
          ...quest,
          active: false,
        }
      }
      return {
        ...quest,
      }
    })

    return { questExists, updatedQuests, alreadyActive: false }
  }

  const claimQuestReward = (
    claimedQuest: Quest,
    allQuests: Quest[],
    user: User,
    allTasks: Task[],
    allTags: Tag[],
  ): ClaimQuestRewardResult => {
    const questExists = validateExistance(claimedQuest.id, allQuests)
    const tagExists = allTags.find((tag) => tag.id === claimedQuest.tag_id)
    if (!questExists || !tagExists)
      return {
        questExists,
        updatedUser: user,
        updatedTags: allTags,
        updatedQuests: allQuests,
        notCompleted: false,
        crystalsGained: 0,
        userExpGained: 0,
        tagExpGained: 0,
        tagTitle: '',
        levelUp: false,
        tagLevelUp: false,
      }

    const tasksInQuest = allTasks.filter((task) => task.quest_id === claimedQuest.id)
    const tasksCompleted = tasksInQuest.every((task) => task.completed)
    if (!tasksCompleted)
      return {
        questExists,
        updatedUser: user,
        updatedTags: allTags,
        updatedQuests: allQuests,
        notCompleted: true,
        crystalsGained: 0,
        userExpGained: 0,
        tagExpGained: 0,
        tagTitle: '',
        levelUp: false,
        tagLevelUp: false,
      }

    const reward = getQuestProgressionReward(claimedQuest, tasksInQuest)

    const userLvlBefore = user.level
    const tagLvlBefore = tagExists.level

    let updatedUser = {
      ...user,
      balance: user.balance + reward.crystals,
      exp_gained: user.exp_gained + reward.userExp,
      crystals_gained: user.crystals_gained + reward.crystals,
      questlines_done: user.questlines_done + 1,
    }
    updatedUser = updateUserLevel(updatedUser, reward.userExp)

    let updatedTag = tagExists
    updatedTag = updateTagLevel(updatedTag, reward.tagExp)

    let levelUp = false
    if (userLvlBefore < updatedUser.level) levelUp = true
    let tagLevelUp = false
    if (tagLvlBefore < updatedTag.level) tagLevelUp = true

    const updatedQuests = deleteQuest(claimedQuest.id, allQuests, allTasks).updatedQuests
    const updatedTags = allTags.map((tag) => {
      if (tag.id === updatedTag.id) {
        return {
          ...tag,
          level: updatedTag.level,
          exp_current: updatedTag.exp_current,
          exp_needed: updatedTag.exp_needed,
        }
      }
      return { ...tag }
    })

    return {
      questExists,
      updatedUser,
      updatedQuests,
      updatedTags,
      notCompleted: false,
      crystalsGained: reward.crystals,
      userExpGained: reward.userExp,
      tagExpGained: reward.tagExp,
      tagTitle: updatedTag.title,
      levelUp,
      tagLevelUp,
    }
  }

  return {
    addQuest,
    editQuest,
    deleteQuest,
    activateQuest,
    claimQuestReward,
  }
}
