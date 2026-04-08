import { nextID } from '../helpers/nextID'
import { Questline, Quest, Task, QuestlineDone, User } from '../db/types'

import { normalizePositionAfterDeletion } from '../helpers/positionNormalizer'
import { useValidations } from '../helpers/useValidations'
const { validateExistance, validateTitle } = useValidations()

import { updateLevels } from '../helpers/updateLevels'
const { updateUserLevel } = updateLevels()

import { useProgressions } from '../../shared/utils/useProgressions'
const { getQuestlineProgressionReward } = useProgressions()

type EditQuestlineResult = {
  questlineExists: boolean
  titleValid: boolean
  descriptionValid: boolean
  updatedQuestlines: Questline[]
}

type AddQuestlineResult = {
  titleValid: boolean
  descriptionValid: boolean
  updatedQuestlines: Questline[]
}

type DeleteQuestlineResult = {
  questlineExists: boolean
  updatedQuestlines: Questline[]
  updatedQuests: Quest[]
  updatedTasks: Task[]
}

type ActivateQuestlineResult = {
  questlineExists: boolean
  updatedQuestlines: Questline[]
  alreadyActive: boolean
}

type FinishQuestlineResult = {
  questlineExists: boolean
  updatedUser: User
  updatedQuestlines: Questline[]
  updatedQuests: Quest[]
  updatedTasks: Task[]
  updatedQuestlinesDone: QuestlineDone[]
  notCompleted: boolean
  crystalsGained: number
  userExpGained: number
  levelUp: boolean
}

type CompleteQuestlineResult = {
  updatedUser: User
  updatedQuestlines: Questline[]
  updatedQuests: Quest[]
  updatedTasks: Task[]
  updatedQuestlinesDone: QuestlineDone[]
  crystalsGained: number
  userExpGained: number
  levelUp: boolean
}

export function useQuestlines() {
  const addQuestline = (
    addedQuestline: Questline,
    allQuestlines: Questline[],
  ): AddQuestlineResult => {
    const titleValid = validateTitle(addedQuestline.title)
    const descriptionValid = validateTitle(addedQuestline.description)

    if (!titleValid || !descriptionValid)
      return { titleValid, descriptionValid, updatedQuestlines: allQuestlines }

    const nextId = nextID(allQuestlines)
    const nextPosition = allQuestlines.length

    const newQuestline = {
      id: nextId,
      title: addedQuestline.title,
      description: addedQuestline.description,
      time_spent: 0,
      active: allQuestlines.length === 0,
      created_at: new Date().toISOString().slice(0, 10),
      position: nextPosition,
    }

    const updatedQuestlines = allQuestlines.length === 0
      ? [newQuestline]
      : [...allQuestlines, newQuestline]

    return { titleValid, descriptionValid, updatedQuestlines }
  }

  const editQuestline = (
    editedQuestline: Questline,
    allQuestlines: Questline[],
  ): EditQuestlineResult => {
    const questlineExists = validateExistance(editedQuestline.id, allQuestlines)
    const titleValid = validateTitle(editedQuestline.title)
    const descriptionValid = validateTitle(editedQuestline.description)

    if (!questlineExists || !titleValid || !descriptionValid)
      return { questlineExists, titleValid, descriptionValid, updatedQuestlines: allQuestlines }

    const updatedQuestlines = allQuestlines.map((questline) => {
      if (questline.id === editedQuestline.id) {
        return {
          ...questline,
          title: editedQuestline.title,
          description: editedQuestline.description,
        }
      }
      return { ...questline }
    })

    return { questlineExists, titleValid, descriptionValid, updatedQuestlines }
  }

  const deleteQuestline = (
    questlineId: number,
    allQuestlines: Questline[],
    allQuests: Quest[],
    allTasks: Task[],
  ): DeleteQuestlineResult => {
    const questlineExists = validateExistance(questlineId, allQuestlines)
    if (!questlineExists)
      return {
        questlineExists,
        updatedQuestlines: allQuestlines,
        updatedQuests: allQuests,
        updatedTasks: allTasks,
      }

    const questsInQuestline = allQuests.filter((quest) => quest.questline_id === questlineId)
    const questIds = questsInQuestline.map((quest) => quest.id)

    const updatedQuests = allQuests.filter((quest) => !questIds.includes(quest.id))
    const updatedTasks = allTasks.filter((task) => !questIds.includes(task.quest_id))

    const questlineToDelete = questlineExists
    const updatedQuestlinesPreNormalizing = allQuestlines.filter(
      (questline) => questline.id !== questlineToDelete.id,
    )

    const updatedQuestlinesPreReactivation = normalizePositionAfterDeletion(
      updatedQuestlinesPreNormalizing,
      questlineToDelete.position,
    )

    let updatedQuestlines = updatedQuestlinesPreReactivation

    if (updatedQuestlinesPreReactivation.length > 0) {
      const questlineToActivate = updatedQuestlinesPreReactivation[0]
      updatedQuestlines = activateQuestline(
        questlineToActivate,
        updatedQuestlinesPreReactivation,
      ).updatedQuestlines
    }

    return { questlineExists, updatedQuestlines, updatedQuests, updatedTasks }
  }

  const activateQuestline = (
    activatedQuestline: Questline,
    allQuestlines: Questline[],
  ): ActivateQuestlineResult => {
    const questlineExists = validateExistance(activatedQuestline.id, allQuestlines)
    if (!questlineExists)
      return { questlineExists, updatedQuestlines: allQuestlines, alreadyActive: false }

    if (activatedQuestline.active)
      return { questlineExists, updatedQuestlines: allQuestlines, alreadyActive: true }

    const updatedQuestlines = allQuestlines.map((questline) => {
      if (questline.id === activatedQuestline.id) {
        return {
          ...questline,
          active: true,
        }
      }
      return {
        ...questline,
        active: false,
      }
    })

    return { questlineExists, updatedQuestlines, alreadyActive: false }
  }

  const claimQuestlineReward = (
    claimedQuestline: Questline,
    allQuestlines: Questline[],
    allQuestlinesDone: QuestlineDone[],
    user: User,
    allQuests: Quest[],
    allTasks: Task[],
  ): FinishQuestlineResult => {
    const questlineExists = validateExistance(claimedQuestline.id, allQuestlines)
    if (!questlineExists)
      return {
        questlineExists,
        updatedUser: user,
        updatedQuestlines: allQuestlines,
        updatedQuests: allQuests,
        updatedTasks: allTasks,
        updatedQuestlinesDone: allQuestlinesDone,
        notCompleted: false,
        crystalsGained: 0,
        userExpGained: 0,
        levelUp: false,
      }

    const questsInQuestline = allQuests.filter(
      (quest) => quest.questline_id === claimedQuestline.id,
    )
    const questsCompleted = questsInQuestline.length === 0
    if (!questsCompleted)
      return {
        questlineExists,
        updatedUser: user,
        updatedQuestlines: allQuestlines,
        updatedQuests: allQuests,
        updatedTasks: allTasks,
        updatedQuestlinesDone: allQuestlinesDone,
        notCompleted: true,
        crystalsGained: 0,
        userExpGained: 0,
        levelUp: false,
      }

    const reward = getQuestlineProgressionReward(claimedQuestline)
    const completionResult = completeQuestline(
      claimedQuestline,
      allQuestlines,
      allQuestlinesDone,
      user,
      allQuests,
      allTasks,
      reward.crystals,
      reward.userExp,
      true,
    )

    return {
      questlineExists,
      updatedUser: completionResult.updatedUser,
      updatedQuestlines: completionResult.updatedQuestlines,
      updatedQuests: completionResult.updatedQuests,
      updatedTasks: completionResult.updatedTasks,
      updatedQuestlinesDone: completionResult.updatedQuestlinesDone,
      notCompleted: false,
      crystalsGained: completionResult.crystalsGained,
      userExpGained: completionResult.userExpGained,
      levelUp: completionResult.levelUp,
    }
  }

  const cancelQuestline = (
    canceledQuestline: Questline,
    allQuestlines: Questline[],
    allQuestlinesDone: QuestlineDone[],
    user: User,
    allQuests: Quest[],
    allTasks: Task[],
  ): FinishQuestlineResult => {
    const questlineExists = validateExistance(canceledQuestline.id, allQuestlines)
    if (!questlineExists)
      return {
        questlineExists,
        updatedUser: user,
        updatedQuestlines: allQuestlines,
        updatedQuests: allQuests,
        updatedTasks: allTasks,
        updatedQuestlinesDone: allQuestlinesDone,
        notCompleted: false,
        crystalsGained: 0,
        userExpGained: 0,
        levelUp: false,
      }

    const reward = getQuestlineProgressionReward(canceledQuestline)
    const halfCrystals = Math.floor(reward.crystals / 2)
    const halfUserExp = Math.floor(reward.userExp / 2)

    const completionResult = completeQuestline(
      canceledQuestline,
      allQuestlines,
      allQuestlinesDone,
      user,
      allQuests,
      allTasks,
      halfCrystals,
      halfUserExp,
      false,
    )

    return {
      questlineExists,
      updatedUser: completionResult.updatedUser,
      updatedQuestlines: completionResult.updatedQuestlines,
      updatedQuests: completionResult.updatedQuests,
      updatedTasks: completionResult.updatedTasks,
      updatedQuestlinesDone: completionResult.updatedQuestlinesDone,
      notCompleted: false,
      crystalsGained: completionResult.crystalsGained,
      userExpGained: completionResult.userExpGained,
      levelUp: completionResult.levelUp,
    }
  }

  const completeQuestline = (
    questline: Questline,
    allQuestlines: Questline[],
    allQuestlinesDone: QuestlineDone[],
    user: User,
    allQuests: Quest[],
    allTasks: Task[],
    crystalsReward: number,
    userExpReward: number,
    status: boolean,
  ): CompleteQuestlineResult => {
    const userLvlBefore = user.level

    let updatedUser = {
      ...user,
      balance: user.balance + crystalsReward,
      exp_gained: user.exp_gained + userExpReward,
      crystals_gained: user.crystals_gained + crystalsReward,
      questlines_done: user.questlines_done + 1,
    }
    updatedUser = updateUserLevel(updatedUser, userExpReward)

    const levelUp = userLvlBefore < updatedUser.level

    const nextId = nextID(allQuestlinesDone)
    const updatedQuestlinesDone = [
      ...allQuestlinesDone,
      {
        id: nextId,
        name: questline.title,
        created_at: questline.created_at,
        time_spent: questline.time_spent,
        status,
      },
    ]

    const deletionResult = deleteQuestline(questline.id, allQuestlines, allQuests, allTasks)

    return {
      updatedUser,
      updatedQuestlines: deletionResult.updatedQuestlines,
      updatedQuests: deletionResult.updatedQuests,
      updatedTasks: deletionResult.updatedTasks,
      updatedQuestlinesDone,
      crystalsGained: crystalsReward,
      userExpGained: userExpReward,
      levelUp,
    }
  }

  return {
    addQuestline,
    editQuestline,
    deleteQuestline,
    activateQuestline,
    claimQuestlineReward,
    cancelQuestline,
  }
}
