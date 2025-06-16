import { useDates } from '../../shared/helpers/useDate'
import type { DbSchema } from './types'

const { getToday } = useDates()

const defaultData: DbSchema = {
  user: {
    balance: 0,
    level: 1,
    exp_current: 0,
    exp_needed: 60,
    focused_time: 0,
    pomodoros: 0,
    questlines_done: 0,
    todos_done: 0,
    ideas_total: 0,
    habits_implemented: 0,
    exp_gained: 0,
    crystals_gained: 0,
    rewards_unlocked: 0,
    created_at: getToday(),
  },
  questlines: [],
  quests: [],
  tasks: [],
  tags: [],
  ideas: [],
  habit_stacks: [],
  habits: [],
  rewards: [],
  questlines_done: [],
  achievements: [],
}

export default defaultData
