export function nextID(array: any[]) {
  return array.at(-1)?.id + 1 || 1
}
