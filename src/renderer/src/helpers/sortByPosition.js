/**
 * @function sortByPosition - Sorts passed items by their position property
 * @param {Array} items - The array of items to sort.
 * @returns {Array} - The sorted array of items.
 */
export const sortByPosition = (items) => {
  return items.sort((a, b) => a.position - b.position)
}
