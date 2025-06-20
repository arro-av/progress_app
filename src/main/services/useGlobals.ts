import { Reward, Habit, Tag, Idea, HabitStack, Quest, Task } from '../db/types.ts'
import { useValidations } from '../helpers/useValidations'
const { validateExistance } = useValidations()

export function useGlobals() {
  const updateItemPositions = (
    itemToMove: Reward | Habit | Tag | Idea | HabitStack | Quest | Task,
    allPassedItems: (Reward | Habit | Tag | Idea | HabitStack | Quest | Task)[],
    allItems: (Reward | Habit | Tag | Idea | HabitStack | Quest | Task)[],
    direction: 'up' | 'down',
  ) => {
    const itemExists = validateExistance(itemToMove.id, allItems)
    const directionValid = direction === 'up' || direction === 'down'
    if (!itemExists || !directionValid)
      return { itemExists, directionValid, updatedItems: allItems }

    const currentPosition = itemToMove.position

    if (currentPosition === 0 && direction === 'up')
      return {
        itemExists,
        directionValid,
        updatedItems: allItems,
        atTop: true,
      }
    if (currentPosition === allPassedItems.length - 1 && direction === 'down')
      return {
        itemExists,
        directionValid,
        updatedItems: allItems,
        atBottom: true,
      }

    const movingItem = itemExists
    const newPosition = direction === 'up' ? currentPosition - 1 : currentPosition + 1

    const updatedItemsMap = new Map()
    allPassedItems.forEach((item) => {
      if (item.position === newPosition) {
        updatedItemsMap.set(item.id, { ...item, position: currentPosition })
      } else if (item.id === movingItem.id) {
        updatedItemsMap.set(item.id, { ...item, position: newPosition })
      } else {
        updatedItemsMap.set(item.id, { ...item })
      }
    })

    // Merge with allItems, using updated items where they exist
    const updatedItems = allItems.map((item) => updatedItemsMap.get(item.id) || { ...item })

    return { itemExists, directionValid, updatedItems, atTop: false, atBottom: false }
  }

  return {
    updateItemPositions,
  }
}
