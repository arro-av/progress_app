export function useConstants() {
  //lvl cap user & tags
  const LEVEL_CAP = 60

  //exp multipliers - exponential progression
  const EXP_MULTIPLIER_USER = (level: number) => {
    return Math.round(60 * 1.13 ** level)
  }
  const EXP_MULTIPLIER_TAGS = (level: number) => {
    return Math.round(60 * 1.1 ** level)
  }

  const MAX_TIMER_DURATION = 120
  const MIN_TIMER_DURATION = 1

  return {
    LEVEL_CAP,
    EXP_MULTIPLIER_USER,
    EXP_MULTIPLIER_TAGS,
    MAX_TIMER_DURATION,
    MIN_TIMER_DURATION,
  }
}
