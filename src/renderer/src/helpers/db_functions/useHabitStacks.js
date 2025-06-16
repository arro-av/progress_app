/**
 * HABIT STACKS RELATED COMPOSABLE
 * --------------------------------------------------------------------------------------------------------------
 * @function addHabitStack {function} - Adds a habit stack to the database
 * @function editHabitStack {function} - Edits a habit stack in the database
 * @function onHabitStacksUpdate {function} - Listens for habit stack updates from the database
 */

export function useHabitStacks() {
    const addHabitStack = async (habitStack) => {
        return await window.api.addHabitStack(habitStack)
    }

    const editHabitStack = async (habitStack) => {
        return await window.api.editHabitStack(habitStack)
    }

    const onHabitStacksUpdate = (callback) => {
        return window.api.onHabitStacksUpdate(callback)
    }

    return {
        addHabitStack,
        editHabitStack,
        onHabitStacksUpdate
    }
}