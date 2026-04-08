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
  primaryTagValid: boolean
  secondaryTagValid: boolean
  updatedQuests: Quest[]
}

type EditQuestResult = {
  questExists: boolean
  titleValid: boolean
  primaryTagValid: boolean
  secondaryTagValid: boolean
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
  updatedTasks: Task[]
  notCompleted: boolean
  crystalsGained: number
  userExpGained: number
  tagExpGained: number
  tagTitles: string[]
  levelUp: boolean
  tagLevelUps: string[]
}

export function useQuests() {
  const addQuest = (addedQuest: Quest, allQuests: Quest[], allTags: Tag[]): AddQuestResult => {
    const titleValid = validateTitle(addedQuest.title)
    const primaryTagValid = validateTag(addedQuest.tag_id_1, allTags)
    const secondaryTagValid =
      addedQuest.tag_id_2 === null || validateTag(addedQuest.tag_id_2, allTags)
    if (!titleValid || !primaryTagValid || !secondaryTagValid)
      return { titleValid, primaryTagValid, secondaryTagValid, updatedQuests: allQuests }

    const nextId = nextID(allQuests)
    const nextPosition = allQuests.filter(
      (quest) => quest.questline_id === addedQuest.questline_id,
    ).length

    const newQuest = {
      ...addedQuest,
      id: nextId,
      title: addedQuest.title,
      time_spent: 0,
      questline_id: addedQuest.questline_id,
      tag_id_1: addedQuest.tag_id_1,
      tag_id_2: addedQuest.tag_id_2,
      active: false,
      position: nextPosition,
    }

    const updatedQuests = [...allQuests, newQuest]

    return { titleValid, primaryTagValid, secondaryTagValid, updatedQuests }
  }

  const editQuest = (editedQuest: Quest, allQuests: Quest[], allTags: Tag[]): EditQuestResult => {
    const questExists = validateExistance(editedQuest.id, allQuests)
    const titleValid = validateTitle(editedQuest.title)
    const primaryTagValid = validateTag(editedQuest.tag_id_1, allTags)
    const secondaryTagValid =
      editedQuest.tag_id_2 === null || validateTag(editedQuest.tag_id_2, allTags)

    if (!questExists || !titleValid || !primaryTagValid || !secondaryTagValid)
      return {
        questExists,
        titleValid,
        primaryTagValid,
        secondaryTagValid,
        updatedQuests: allQuests,
      }

    const updatedQuests = allQuests.map((quest) => {
      if (quest.id === editedQuest.id) {
        return {
          ...quest,
          title: editedQuest.title,
          tag_id_1: editedQuest.tag_id_1,
          tag_id_2: editedQuest.tag_id_2,
        }
      }
      return { ...quest }
    })

    return { questExists, titleValid, primaryTagValid, secondaryTagValid, updatedQuests }
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
      const questToActivate = questsInQuestline[0]
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
    const primaryTag = allTags.find((tag) => tag.id === claimedQuest.tag_id_1)
    const secondaryTag =
      claimedQuest.tag_id_2 === null
        ? null
        : allTags.find((tag) => tag.id === claimedQuest.tag_id_2) ?? null

    if (!questExists || !primaryTag)
      return {
        questExists,
        updatedUser: user,
        updatedTags: allTags,
        updatedQuests: allQuests,
        updatedTasks: allTasks,
        notCompleted: false,
        crystalsGained: 0,
        userExpGained: 0,
        tagExpGained: 0,
        tagTitles: [],
        levelUp: false,
        tagLevelUps: [],
      }

    const tasksInQuest = allTasks.filter((task) => task.quest_id === claimedQuest.id)
    const tasksCompleted = tasksInQuest.length > 0 && tasksInQuest.every((task) => task.completed)
    if (!tasksCompleted)
      return {
        questExists,
        updatedUser: user,
        updatedTags: allTags,
        updatedQuests: allQuests,
        updatedTasks: allTasks,
        notCompleted: true,
        crystalsGained: 0,
        userExpGained: 0,
        tagExpGained: 0,
        tagTitles: [],
        levelUp: false,
        tagLevelUps: [],
      }

    const reward = getQuestProgressionReward(claimedQuest, tasksInQuest)

    const userLvlBefore = user.level
    const tagTargets = [primaryTag, secondaryTag].filter(Boolean) as Tag[]
    const tagLevelsBefore = new Map(tagTargets.map((tag) => [tag.id, tag.level]))

    let updatedUser = {
      ...user,
      balance: user.balance + reward.crystals,
      exp_gained: user.exp_gained + reward.userExp,
      crystals_gained: user.crystals_gained + reward.crystals,
    }
    updatedUser = updateUserLevel(updatedUser, reward.userExp)

    const updatedTagMap = new Map<number, Tag>()
    tagTargets.forEach((tag) => {
      updatedTagMap.set(tag.id, updateTagLevel(tag, reward.tagExp))
    })

    const updatesAfterDelete = deleteQuest(claimedQuest.id, allQuests, allTasks)
    const updatedQuests = updatesAfterDelete.updatedQuests
    const updatedTasks = updatesAfterDelete.updatedTasks

    const updatedTags = allTags.map((tag) => {
      const updatedTag = updatedTagMap.get(tag.id)
      if (updatedTag) {
        return {
          ...tag,
          time_spent: tag.time_spent + claimedQuest.time_spent,
          level: updatedTag.level,
          exp_current: updatedTag.exp_current,
          exp_needed: updatedTag.exp_needed,
        }
      }
      return { ...tag }
    })

    let levelUp = false
    if (userLvlBefore < updatedUser.level) levelUp = true

    const tagLevelUps = updatedTags
      .filter((tag) => updatedTagMap.has(tag.id))
      .filter((tag) => (tagLevelsBefore.get(tag.id) ?? tag.level) < tag.level)
      .map((tag) => tag.title)

    return {
      questExists,
      updatedUser,
      updatedQuests,
      updatedTags,
      updatedTasks,
      notCompleted: false,
      crystalsGained: reward.crystals,
      userExpGained: reward.userExp,
      tagExpGained: reward.tagExp,
      tagTitles: tagTargets.map((tag) => tag.title),
      levelUp,
      tagLevelUps,
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
