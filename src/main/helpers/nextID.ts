export function nextID(array: any[]): number {
  return array.at(-1)?.id + 1 || 1
}
