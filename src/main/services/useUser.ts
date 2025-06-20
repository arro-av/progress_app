// Actually don't really need this one
export function useUser() {
  const addBalance = (currentBalance: number, amount: number) => {
    return currentBalance + amount
  }

  const removeBalance = (currentBalance: number, amount: number) => {
    return currentBalance - amount
  }

  return {
    addBalance,
    removeBalance,
  }
}
