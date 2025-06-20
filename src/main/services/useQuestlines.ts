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

type ClaimQuestlineRewardResult = {
  questlineExists: boolean
  updatedUser: User
  updatedQuestlines: Questline[]
  updatedQuestlinesDone: QuestlineDone[]
  notCompleted: boolean
  crystalsGained: number
  userExpGained: number
  levelUp: boolean
}

export function useQuestlines() {
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

    // validation returns questline object if it exists
    const questlineToDelete = questlineExists
    const updatedQuestlinesPreNormalizing = allQuestlines.filter(
      (questline) => questline.id !== questlineToDelete.id,
    )

    const updatedQuestlinesPreReactivation = normalizePositionAfterDeletion(
      updatedQuestlinesPreNormalizing,
      questlineToDelete.position,
    )

    const questlineToActivate = updatedQuestlinesPreReactivation[0]
    const updatedQuestlines = activateQuestline(
      questlineToActivate,
      updatedQuestlinesPreReactivation,
    ).updatedQuestlines

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
  ): ClaimQuestlineRewardResult => {
    const questlineExists = validateExistance(claimedQuestline.id, allQuestlines)
    if (!questlineExists)
      return {
        questlineExists,
        updatedUser: user,
        updatedQuestlines: allQuestlines,
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
        updatedQuestlinesDone: allQuestlinesDone,
        notCompleted: true,
        crystalsGained: 0,
        userExpGained: 0,
        levelUp: false,
      }

    const reward = getQuestlineProgressionReward(claimedQuestline)

    const userLvlBefore = user.level

    let updatedUser = {
      ...user,
      balance: user.balance + reward.crystals,
      exp_gained: user.exp_gained + reward.userExp,
      crystals_gained: user.crystals_gained + reward.crystals,
      questlines_done: user.questlines_done + 1,
    }
    updatedUser = updateUserLevel(updatedUser, reward.userExp)

    let levelUp = false
    if (userLvlBefore < updatedUser.level) levelUp = true

    const nextId = nextID(allQuestlinesDone)
    const updatedQuestlinesDone = [
      ...allQuestlinesDone,
      {
        id: nextId,
        name: claimedQuestline.title,
        created_at: claimedQuestline.created_at,
        time_spent: claimedQuestline.time_spent,
      },
    ]

    const updatedQuestlines = deleteQuestline(
      claimedQuestline.id,
      allQuestlines,
      allQuests,
      allTasks,
    ).updatedQuestlines

    return {
      questlineExists,
      updatedUser,
      updatedQuestlines,
      updatedQuestlinesDone,
      notCompleted: false,
      crystalsGained: reward.crystals,
      userExpGained: reward.userExp,
      levelUp,
    }
  }

  return {
    editQuestline,
    deleteQuestline,
    activateQuestline,
    claimQuestlineReward,
  }
}
