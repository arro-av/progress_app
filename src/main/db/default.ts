import type { DbSchema } from './types'

const createYearHeatmap = (multiplier: number, offset: number): number[] =>
  Array.from({ length: 365 }, (_, index) => {
    if (index % 11 === 0) return 0
    return ((index * multiplier + offset) % 150) + 5
  })

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
    exp_gained: 0,
    crystals_gained: 0,
    rewards_unlocked: 0,
    created_at: '2025-06-13',
  },
  settings: {
    timer_min: 2,
    timer_max: 600,
    timer_default_session: 25,
  },
  years: [],
  questlines: [
    {
      id: 1,
      title: 'Example Questline',
      description: 'Example Desc',
      time_spent: 45,
      active: true,
      created_at: '2026-04-01',
      position: 0,
    },
  ],
  quests: [
    {
      id: 1,
      title: 'Example Quest',
      time_spent: 20,
      questline_id: 1,
      tag_id_1: 1,
      tag_id_2: 1,
      active: true,
      position: 0,
    },
  ],
  tasks: [
    {
      id: 1,
      title: 'Example Task',
      quest_id: 1,
      completed: true,
      position: 0,
    },
  ],
  tags: [
    {
      id: 1,
      title: 'Example Skill',
      level: 1,
      exp_current: 0,
      exp_needed: 60,
      time_spent: 0,
      created_at: '2026-04-01',
      position: 0,
    },
  ],
  rewards: [
    {
      id: 1,
      title: 'Example Reward',
      cost: 10,
      repeatable: true,
      position: 0,
    },
  ],
  questlines_done: [],
}

export default defaultData
