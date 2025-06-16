import { useRanks } from './useRanks'
const { getHabitRank, getTodoListRank } = useRanks()
import { useConstants } from './useConstants'
const { EXP_MULTIPLIER_USER, EXP_MULTIPLIER_TAGS } = useConstants()

/**
 * PROGRESSIONS HELPER
 * --------------------------------------------------------------------------------------------------------------
 * @function getHabitProgressionReward {function} - Gets habit progression reward based on habit rank
 * @function getQuestProgressionReward {function} - Gets quest progression reward based on quest rank
 * @function getQuestlineProgressionReward {function} - Gets questline progression reward based on time spent
 */
export const useProgressions = () => {
  const getHabitProgressionReward = (habit) => {
    const habitRank = getHabitRank(habit)

    switch (habitRank) {
      case 'common':
        return {
          exp: 10,
          crystals: 1,
        }
      case 'uncommon':
        return {
          exp: 20,
          crystals: 2,
        }
      case 'rare':
        return {
          exp: 30,
          crystals: 3,
        }
      case 'epic':
        return {
          exp: 40,
          crystals: 4,
        }
      case 'legendary':
        return {
          exp: 50,
          crystals: 5,
        }
    }
  }

  const getQuestProgressionReward = (quest, questsInQuestlines) => {
    return {
      crystals: Math.round(questsInQuestlines.length + quest.time_spent / 10),
      tagExp: Math.round(questsInQuestlines.length * 10 + quest.time_spent / 2),
      userExp: Math.round(questsInQuestlines.length * 15 + quest.time_spent / 1.35),
    }
  }

  const getQuestlineProgressionReward = (questline) => {
    return {
      crystals: Math.round(questline.time_spent / 10),
      userExp: Math.round(questline.time_spent / 1.35),
    }
  }

  function updateLevel(levelObj, expChange, isUser) {
    let newExp = levelObj.exp_current + expChange
    let newLevel = levelObj.level

    // Handle leveling up
    while (newExp >= levelObj.exp_needed) {
      newExp -= levelObj.exp_needed
      newLevel++
      levelObj.exp_needed = isUser ? EXP_MULTIPLIER_USER(newLevel) : EXP_MULTIPLIER_TAGS(newLevel)
    }

    // Handle leveling down (for undoing)
    while (newExp < 0 && newLevel > 1) {
      newLevel--
      const prevExpNeeded = isUser ? EXP_MULTIPLIER_USER(newLevel) : EXP_MULTIPLIER_TAGS(newLevel)
      newExp += prevExpNeeded
      levelObj.exp_needed = prevExpNeeded
    }

    levelObj.level = newLevel
    levelObj.exp_current = Math.max(0, newExp) // Ensure exp doesn't go below 0
  }

  return {
    getHabitProgressionReward,
    getQuestProgressionReward,
    getQuestlineProgressionReward,
    updateLevel,
  }
}
