import { User, Tag } from '../db/types'
import { useXPMultipliers } from '../../shared/constants/useXPMultipliers'
const { EXP_MULTIPLIER_USER, EXP_MULTIPLIER_TAGS } = useXPMultipliers()

export function updateLevels(): {
  updateUserLevel: (user: User, expChange: number) => User
  updateTagLevel: (tag: Tag, expChange: number) => Tag
} {
  const updateUserLevel = (user: User, expChange: number) => {
    let newExp = user.exp_current + expChange
    let newLevel = user.level

    // Handle leveling up
    while (newExp >= user.exp_needed) {
      newExp -= user.exp_needed
      newLevel++
      user.exp_needed = EXP_MULTIPLIER_USER(newLevel)
    }

    // Handle leveling down (for undoing)
    while (newExp < 0 && newLevel > 1) {
      newLevel--
      const prevExpNeeded = EXP_MULTIPLIER_USER(newLevel)
      newExp += prevExpNeeded
      user.exp_needed = prevExpNeeded
    }

    const newUserState = {
      ...user,
      level: newLevel,
      exp_current: Math.max(0, newExp),
      exp_needed: user.exp_needed,
    }

    return newUserState
  }

  const updateTagLevel = (tag: Tag, expChange: number) => {
    let newExp = tag.exp_current + expChange
    let newLevel = tag.level

    // Handle leveling up
    while (newExp >= tag.exp_needed) {
      newExp -= tag.exp_needed
      newLevel++
      tag.exp_needed = EXP_MULTIPLIER_TAGS(newLevel)
    }

    // Handle leveling down (for undoing)
    while (newExp < 0 && newLevel > 1) {
      newLevel--
      const prevExpNeeded = EXP_MULTIPLIER_TAGS(newLevel)
      newExp += prevExpNeeded
      tag.exp_needed = prevExpNeeded
    }

    const newTagState = {
      ...tag,
      level: newLevel,
      exp_current: Math.max(0, newExp),
      exp_needed: tag.exp_needed,
    }

    return newTagState
  }

  return {
    updateUserLevel,
    updateTagLevel,
  }
}
