import { Tag, Quest, Questline } from '../../main/db/types'

type Rank = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic'

export const useRanks = () => {
  const getTagRank = (tag: Tag): Rank => {
    if (tag.level > 76) return 'mythic'
    else if (tag.level > 64) return 'legendary'
    else if (tag.level > 48) return 'epic'
    else if (tag.level > 28) return 'rare'
    else if (tag.level > 12) return 'uncommon'
    else return 'common'
  }

  const getQuestlineRank = (questline: Questline): Rank => {
    if (questline.time_spent >= 4800)
      return 'mythic' // 80h
    else if (questline.time_spent >= 2400)
      return 'legendary' // 40h
    else if (questline.time_spent >= 1200)
      return 'epic' // 20h
    else if (questline.time_spent >= 480)
      return 'rare' // 8h
    else if (questline.time_spent >= 120)
      return 'uncommon' // 2h
    else return 'common'
  }

  return {
    getTagRank,
    getQuestlineRank,
  }
}
