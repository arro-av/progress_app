import { User } from '../db/types'
import { useXPMultipliers } from '../../shared/constants/useXPMultipliers'
const { EXP_MULTIPLIER_USER } = useXPMultipliers()

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
