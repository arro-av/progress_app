export function useXPMultipliers() {
  const EXP_MULTIPLIER_USER = (level: number) => {
    return Math.round(0.025 * level ** 3 + 0.75 * level ** 2 + 10 * level + 60)
  }
  const EXP_MULTIPLIER_TAGS = (level: number) => {
    return Math.round(0.0025 * level ** 3 + 0.075 * level ** 2 + 10 * level + 60)
  }

  return {
    EXP_MULTIPLIER_USER,
    EXP_MULTIPLIER_TAGS,
  }
}
