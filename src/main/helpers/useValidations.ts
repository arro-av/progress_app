export function useValidations(): {
  validateExistance: (id: number, array: any[]) => any
  validateTitle: (title: string) => boolean
  validateTag: (tag_name: string) => boolean
  validateStack: (stack_id: number) => boolean
  validateCost: (cost: number) => boolean
  validateBalance: (balance: number, cost: number) => boolean
} {
  const validateExistance = (id: number, array: any[]): any => {
    const index = array.findIndex((item) => item.id === id)
    if (index === -1) return false
    return array[index]
  }

  const validateTitle = (title: string): boolean => {
    if (!title || title.trim() === '') return false
    return true
  }

  const validateTag = (tag_name: string): boolean => {
    if (!tag_name || tag_name.trim() === '') return false
    return true
  }

  const validateStack = (stack_id: number): boolean => {
    if (!stack_id) return false
    return true
  }

  const validateCost = (cost: number): boolean => {
    if (!cost || cost <= 0) return false
    return true
  }

  const validateBalance = (balance: number, cost: number): boolean => {
    if (balance < cost) return false
    return true
  }

  return {
    validateExistance,
    validateTitle,
    validateTag,
    validateStack,
    validateCost,
    validateBalance,
  }
}
