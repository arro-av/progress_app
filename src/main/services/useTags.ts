import { nextID } from '../helpers/nextID'
import { Tag } from '../db/types'

import { normalizePositionAfterDeletion } from '../helpers/positionNormalizer'
import { useValidations } from '../helpers/useValidations'
const { validateExistance, validateTitle } = useValidations()

import { getDates } from '../helpers/getDates'
const { getToday } = getDates()

export function useTags() {
  const addTag = (addedTag: Tag, allTags: Tag[]) => {
    const titleValid = validateTitle(addedTag.title)

    if (!titleValid) return { titleValid, updatedTags: allTags }

    const nextId = nextID(allTags)
    const nextPosition = allTags.length

    const newTag = {
      id: nextId,
      title: addedTag.title,
      level: 1,
      exp_current: 0,
      exp_needed: 60,
      time_spent: 0,
      created_at: getToday(),
      position: nextPosition,
    }

    const updatedTags = [...allTags, newTag]

    return { titleValid, updatedTags }
  }

  const editTag = (editedTag: Tag, allTags: Tag[]) => {
    const tagExists = validateExistance(editedTag.id, allTags)
    const titleValid = validateTitle(editedTag.title)

    if (!tagExists || !titleValid) return { tagExists, titleValid, updatedTags: allTags }

    const updatedTags = allTags.map((tag) => {
      if (tag.id === editedTag.id) {
        return {
          ...tag,
          title: editedTag.title,
        }
      }
      return { ...tag }
    })

    return { tagExists, titleValid, updatedTags }
  }

  const deleteTag = (tagId: number, allTags: Tag[]) => {
    const tagExists = validateExistance(tagId, allTags)
    if (!tagExists) return { tagExists, updatedTags: allTags }

    // validation returns tag object if it exists
    const tagToDelete = tagExists
    const updatedTagsPreNormalizing = allTags.filter((tag) => tag.id !== tagToDelete.id)

    const updatedTagsNormalized = normalizePositionAfterDeletion(
      updatedTagsPreNormalizing,
      tagToDelete.position,
    )

    const updatedTags = updatedTagsNormalized

    return { tagExists, updatedTags }
  }

  return {
    addTag,
    editTag,
    deleteTag,
  }
}
