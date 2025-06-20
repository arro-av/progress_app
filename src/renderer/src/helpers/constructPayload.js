/**
 * CONSTRUCT PAYLOAD HELPER
 * --------------------------------------------------------------------------------------------------------------
 * @function constructPayload - Constructs a payload based on the item type.
 * @param {string} itemType - The type of item (e.g., 'reward', 'tag').
 * @returns {object} - The constructed payload.
 */

export const constructPayload = (itemType) => {
  switch (itemType) {
    case 'rewards':
      return {
        title: '',
        cost: 0,
        repeatable: false,
      }
    case 'tags':
      return {
        title: '',
      }
    case 'habit_stacks':
      return {
        title: '',
      }
    case 'ideas':
      return {
        title: '',
        description: '',
      }
    case 'habits':
      return {
        title: '',
        tag_id: null,
        stack_id: null,
      }
    case 'quests':
      return {
        title: '',
        questline_id: null,
        time_spent: 0,
        tag_id: null,
        position: 0,
      }
    case 'tasks':
      return {
        title: '',
        quest_id: null,
        completed: false,
        position: 0,
      }
    default:
      console.warn(`Unknown itemType: ${itemType}.`)
      return null
  }
}
