import { useToasts } from '../composables/useToasts'
const { addToast } = useToasts()

/**
 * PROJECTS RELATED COMPOSABLE
 * --------------------------------------------------------------------------------------------------------------
 * @function !addProject !! NOT IMPLEMENTED - Projects addable via idea-to-project-conversion (Ideas.vue)
 * @function editProject {function} - Edits a project in the database
 * @function onProjectsUpdate {function} - Listens for project updates from the database
 */

export function useProjects() {
  const editProject = async (project) => {
    return await window.api.editProject(project)
  }

  const activateProject = async (project) => {
    try {
      const result = await window.api.activateProject(project)
      if (result.success) {
        addToast({ message: result.message, type: 'success' })
      } else {
        addToast({ message: result.message, type: 'error' })
      }
    } catch (error) {
      console.error('Error activating project:', error)
      addToast({ message: 'An error occured...', type: 'error' })
    }
  }

  const claimProjectReward = async (project) => {
    try {
      const result = await window.api.claimProjectReward(project)
      if (result.success) {
        addToast({ message: '+' + result.crystalsGained + ' Crystals', type: 'plusCrystals' })
        addToast({ message: '+' + result.userExpGained + ' EXP', type: 'plusExp' })
        if (result.levelUp) addToast({ message: 'Level Up!', type: 'lvlup' })
      } else {
        addToast({ message: result.message, type: 'error' })
      }
    } catch (error) {
      console.error('Error claiming todo list reward:', error)
      addToast({ message: 'An error occured...', type: 'error' })
    }
  }

  const onProjectsUpdate = (callback) => {
    return window.api.onProjectsUpdate(callback)
  }

  return {
    editProject,
    claimProjectReward,
    activateProject,
    onProjectsUpdate,
  }
}
