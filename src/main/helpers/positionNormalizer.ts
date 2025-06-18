export const normalizePositionAfterDeletion = (items: any[], deletedItemPosition: number) => {
  return items.map((item) => {
    if (item.position > deletedItemPosition) {
      return { ...item, position: item.position - 1 }
    }
    return { ...item }
  })
}
