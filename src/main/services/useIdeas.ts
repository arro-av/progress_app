import { nextID } from '../helpers/nextID'
import { Idea, Questline } from '../db/types'

import { normalizePositionAfterDeletion } from '../helpers/positionNormalizer'
import { useValidations } from '../helpers/useValidations'
const { validateExistance, validateTitle } = useValidations()

import { getDates } from '../helpers/getDates'
const { getToday } = getDates()

type AddIdeaResult = {
  titleValid: boolean
  descriptionValid: boolean
  updatedIdeas: Idea[]
  updatedTotalIdeas: number
}

type EditIdeaResult = {
  ideaExists: boolean
  titleValid: boolean
  descriptionValid: boolean
  updatedIdeas: Idea[]
}

type DeleteIdeaResult = {
  ideaExists: boolean
  updatedIdeas: Idea[]
}

type ConvertIdeaToProjectResult = {
  ideaExists: boolean
  updatedQuestlines: Questline[]
  updatedIdeas: Idea[]
}

export function useIdeas() {
  const addIdea = (addedIdea: Idea, allIdeas: Idea[], totalIdeas: number): AddIdeaResult => {
    const titleValid = validateTitle(addedIdea.title)
    const descriptionValid = validateTitle(addedIdea.description) // same validation logic as title

    if (!titleValid || !descriptionValid)
      return { titleValid, descriptionValid, updatedIdeas: allIdeas, updatedTotalIdeas: totalIdeas }

    const nextId = nextID(allIdeas)
    const nextPosition = allIdeas.length

    const newIdea = {
      id: nextId,
      title: addedIdea.title,
      description: addedIdea.description,
      position: nextPosition,
    }

    const updatedIdeas = [...allIdeas, newIdea]
    const updatedTotalIdeas = totalIdeas + 1

    return { titleValid, descriptionValid, updatedIdeas, updatedTotalIdeas }
  }

  const editIdea = (editedIdea: Idea, allIdeas: Idea[]): EditIdeaResult => {
    const ideaExists = validateExistance(editedIdea.id, allIdeas)
    const titleValid = validateTitle(editedIdea.title)
    const descriptionValid = validateTitle(editedIdea.description)

    if (!ideaExists || !titleValid || !descriptionValid)
      return { ideaExists, titleValid, descriptionValid, updatedIdeas: allIdeas }

    const updatedIdeas = allIdeas.map((idea) => {
      if (idea.id === editedIdea.id) {
        return {
          ...idea,
          title: editedIdea.title,
          description: editedIdea.description,
        }
      }
      return { ...idea }
    })

    return { ideaExists, titleValid, descriptionValid, updatedIdeas }
  }

  const deleteIdea = (ideaId: number, allIdeas: Idea[]): DeleteIdeaResult => {
    const ideaExists = validateExistance(ideaId, allIdeas)
    if (!ideaExists) return { ideaExists, updatedIdeas: allIdeas }

    // validation returns idea object if it exists
    const ideaToDelete = ideaExists
    const updatedIdeasPreNormalizing = allIdeas.filter((idea) => idea.id !== ideaToDelete.id)

    const updatedIdeasNormalized = normalizePositionAfterDeletion(
      updatedIdeasPreNormalizing,
      ideaToDelete.position,
    )

    const updatedIdeas = updatedIdeasNormalized

    return { ideaExists, updatedIdeas }
  }

  const convertIdeaToProject = (
    ideaId: number,
    allIdeas: Idea[],
    allQuestlines: Questline[],
  ): ConvertIdeaToProjectResult => {
    const ideaExists = validateExistance(ideaId, allIdeas)
    if (!ideaExists) return { ideaExists, updatedIdeas: allIdeas, updatedQuestlines: allQuestlines }

    const ideaToConvert = ideaExists
    const nextId = (allQuestlines.at(-1)?.id || 0) + 1
    const nextPosition = allQuestlines.length

    const newQuestline = {
      id: nextId,
      title: ideaToConvert.title,
      description: ideaToConvert.description,
      time_spent: 0,
      active: allQuestlines.length === 0 ? true : false,
      created_at: getToday(),
      position: nextPosition,
    }

    const updatedIdeasPreNormalizing = allIdeas.filter((idea) => idea.id !== ideaToConvert.id)

    const updatedIdeasNormalized = normalizePositionAfterDeletion(
      updatedIdeasPreNormalizing,
      ideaToConvert.position,
    )

    const updatedIdeas = updatedIdeasNormalized
    const updatedQuestlines = [...allQuestlines, newQuestline]

    return { ideaExists, updatedQuestlines, updatedIdeas }
  }

  return {
    addIdea,
    editIdea,
    deleteIdea,
    convertIdeaToProject,
  }
}
