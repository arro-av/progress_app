/**
 * @function normalizePositionAfterDeletion - Normalizes the position of items (0, 1, 2....) - after deletion...
 * @param {Array<Object>} items - Array of items with position property
 * @param {number} deletedItemPosition - Position of the deleted item
 */

export const normalizePositionAfterDeletion = (items, deletedItemPosition) => {
  items.forEach((item) => {
    if (item.position > deletedItemPosition) item.position--
  })
}
