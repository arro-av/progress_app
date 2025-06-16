/**
 * SORT-ITEM COMPOSABLE
 * --------------------------------------------------------------------------------------------------------------
 * @function sortByPosition - Sorts passed items by their position property
 * Might add more sorting functions in the future
 */
export function useSort() {
    const sortByPosition = (items) => {
        return items.sort((a, b) => a.position - b.position)
    }

    return {
        sortByPosition
    }
}