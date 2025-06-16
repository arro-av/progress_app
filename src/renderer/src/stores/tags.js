import { defineStore } from 'pinia'
import { ref } from 'vue'
import { sortByPosition } from '../helpers/sortByPosition'

/**
 * TAGS STORE
 * --------------------------------------------------------------------------------------------------------------
 * @var tags {array} - Array of tags
 * @function fetchTags {function} - Fetches tags from the database
 * @function setupListeners {function} - Sets up listeners for tags update events
 * @function addTag {function} - Adds a new tag to the database | {param} Tag object
 * @function editTag {function} - Updates an existing tag in the database | {param} Tag object
 * @function deleteTag {function} - Deletes a tag from the database & normalizes position | {param} Tag ID
 * @function init {function} - Initializes the store by fetching tags & setting up listeners
 * @function cleanupListeners {function} - Cleans up the listeners when a component unmounts
 */
export const useTagsStore = defineStore('tags', () => {
  const tags = ref([])
  const loading = ref(false) // no noteable loading state -> keep for future
  const error = ref(null)
  let cleanupListener = null // holds cleanup function

  const fetchTags = async () => {
    loading.value = true
    try {
      tags.value = await window.api.getTags()
      tags.value = sortByPosition(tags.value)
    } catch (err) {
      error.value = err
      console.error('Error fetching tags:', err)
    } finally {
      loading.value = false
    }
  }

  const setupListeners = () => {
    // if cleanupListener is not null, execute the cleanup function - prevent multiple listeners
    if (cleanupListener) {
      cleanupListener()
    }
    cleanupListener = window.api.onTagsUpdate(fetchTags) // cleanupListener holds the cleanup function
  }

  const cleanupListeners = () => {
    if (cleanupListener) {
      cleanupListener() // execute the cleanup function
      cleanupListener = null
    }
  }

  // logic handled in useAdd.js
  const addTag = async (tag) => {
    return await window.api.addTag(tag)
  }

  // logic handled in useEdit.js
  const editTag = async (tag) => {
    return await window.api.editTag(tag)
  }

  // logic handled in useEdit.js
  const deleteTag = async (id) => {
    return await window.api.deleteTag(id)
  }

  const init = async () => {
    await fetchTags()
    setupListeners()
  }

  return {
    tags,
    loading,
    error,
    fetchTags,
    addTag,
    editTag,
    deleteTag,
    init,
    cleanupListeners,
  }
})
