export function useValidations() {
  const validateExistance = (id: number, array: any[]) => {
    const index = array.findIndex((item) => item.id === id)
    if (index === -1) return false
    return array[index]
  }

  const validateTitle = (title: string) => {
    if (!title || title.trim() === '') return false
    return true
  }

  const validateTag = (tag_name: string) => {
    if (!tag_name || tag_name.trim() === '') return false
    return true
  }

  const validateStack = (stack_id: number) => {
    if (!stack_id) return false
    return true
  }

  const validateCost = (cost: number) => {
    if (!cost || cost <= 0) return false
    return true
  }

  const validateBalance = (balance: number, cost: number) => {
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
