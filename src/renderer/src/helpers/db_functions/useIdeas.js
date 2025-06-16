import { useToasts } from '../composables/useToasts'
const { addToast } = useToasts()

/**
 * IDEAS RELATED COMPOSABLE
 * --------------------------------------------------------------------------------------------------------------
 * @function addIdea {function} - Adds a new idea to the database
 * @function updateIdea {function} - Updates an existing idea in the database
 * @function convertIdeaToProject {function} - Converts an idea to a project
 * @function onIdeasUpdate {function} - Listens for ideas updates from the database
 */
export function useIdeas() {
  const addIdea = async (idea) => {
    return await window.api.addIdea(idea)
  }

  const editIdea = async (idea) => {
    return await window.api.editIdea(idea)
  }

  const convertIdeaToProject = async (id) => {
    try {
      const result = await window.api.convertIdeaToProject(id)
      if (result.success) {
        addToast({ message: result.message, type: 'success' })
      } else {
        addToast({ message: result.message, type: 'error' })
      }
    } catch (error) {
      console.error(error)
      addToast({ message: 'An error occured...', type: 'error' })
    }
  }

  const onIdeasUpdate = (callback) => {
    return window.api.onIdeasUpdate(callback)
  }

  return {
    addIdea,
    editIdea,
    convertIdeaToProject,
    onIdeasUpdate,
  }
}
