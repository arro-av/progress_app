export function useXPMultipliers() {
  const EXP_MULTIPLIER_USER = (level: number) => {
    return Math.round(0.025 * level ** 3.1 + 0.75 * level ** 2 + 10 * level + 80)
  }
  const EXP_MULTIPLIER_TAGS = (level: number) => {
    return Math.round(0.0025 * level ** 3 + 0.05 * level ** 2 + 10 * level + 80)
  }

  return {
    EXP_MULTIPLIER_USER,
    EXP_MULTIPLIER_TAGS,
  }
}
