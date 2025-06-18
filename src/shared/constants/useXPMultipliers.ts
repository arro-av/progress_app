export function useXPMultipliers() {
  const EXP_MULTIPLIER_USER = (level: number) => {
    return Math.round(60 * 1.13 ** level)
  }
  const EXP_MULTIPLIER_TAGS = (level: number) => {
    return Math.round(60 * 1.1 ** level)
  }

  return {
    EXP_MULTIPLIER_USER,
    EXP_MULTIPLIER_TAGS,
  }
}
