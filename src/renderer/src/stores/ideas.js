import { defineStore } from 'pinia'
import { useToasts } from '../helpers/composables/useToasts'
import { ref } from 'vue'
import { sortByPosition } from '../helpers/sortByPosition'

/**
 * IDEAS STORE
 * --------------------------------------------------------------------------------------------------------------
 * @var ideas {array} - Array of ideas
 * @function fetchIdeas {function} - Fetches ideas from the database
 * @function addIdea {function} - Adds a new idea to the database | {param} Idea object
 * @function editIdea {function} - Updates an existing idea in the database | {param} Idea object
 * @function deleteIdea {function} - Deletes an idea from the database & normalizes position | {param} Idea ID
 * @function convertIdeaToProject {function} - Converts an idea to a project | {param} Idea ID
 * --------------------------------------------------------------------------------------------------------------
 * @function setupListeners {function} - Sets up listeners for ideas update events
 * @function cleanupListeners {function} - Cleans up the listeners when a component unmounts
 * @function init {function} - Initializes the store by fetching ideas & setting up listeners
 */
export const useIdeasStore = defineStore('ideas', () => {
  const { addToast } = useToasts()
  const ideas = ref([])
  const loading = ref(false)
  const error = ref(null)
  let cleanupListener = null // To hold the cleanup function from the listener

  const fetchIdeas = async () => {
    loading.value = true
    try {
      ideas.value = await window.api.getIdeas()
      ideas.value = sortByPosition(ideas.value)
    } catch (err) {
      error.value = err
      console.error('Error fetching ideas:', err)
    } finally {
      loading.value = false
    }
  }

  // logic handled in useAdd.js
  const addIdea = async (idea) => {
    return await window.api.addIdea(idea)
  }

  // logic handled in useEdit.js
  const editIdea = async (idea) => {
    return await window.api.editIdea(idea)
  }

  // logic handled in useEdit.js
  const deleteIdea = async (id) => {
    return await window.api.deleteIdea(id)
  }

  const convertIdeaToProject = async (id) => {
    try {
      const result = await window.api.convertIdeaToProject(id)
      if (result.success) {
        addToast({ message: result.message, type: 'success' })
      } else {
        addToast({ message: result.message, type: 'error' })
      }
      return result
    } catch (error) {
      console.error('Error converting idea to project:', error)
      addToast({ message: 'An error occurred...', type: 'error' })
      throw error
    }
  }

  const setupListeners = () => {
    // if cleanupListener is not null, execute the cleanup function - prevent multiple listeners
    if (cleanupListener) {
      cleanupListener()
    }
    cleanupListener = window.api.onIdeasUpdate(fetchIdeas) // cleanupListener holds the cleanup function
  }

  const cleanupListeners = () => {
    if (cleanupListener) {
      cleanupListener() // execute the cleanup function
      cleanupListener = null
    }
  }

  const init = async () => {
    await fetchIdeas()
    setupListeners()
  }

  return {
    ideas,
    loading,
    error,
    fetchIdeas,
    addIdea,
    editIdea,
    deleteIdea,
    convertIdeaToProject,
    init,
    cleanupListeners,
  }
})
