// ========== USER ==========
export interface User {
  balance: number
  level: number
  exp_current: number
  exp_needed: number
  focused_time: number
  pomodoros: number
  questlines_done: number
  todos_done: number
  ideas_total: number
  habits_implemented: number
  rewards_unlocked: number
  exp_gained: number
  crystals_gained: number
  created_at: string
}

// ========== QUESTLINES ==========
export interface Questline {
  id: number
  title: string
  description: string
  time_spent: number
  active: boolean
  created_at: string
  position: number
}

// ========== QUESTS ==========
export interface Quest {
  id: number
  title: string
  time_spent: number
  questline_id: number
  tag_id: number
  active: boolean
  position: number
}

// ========== TASKS ==========
export interface Task {
  id: number
  title: string
  quest_id: number
  completed: boolean
  position: number
}

// ========== QUESTLINES DONE ==========
export interface QuestlineDone {
  id: number
  name: string
  created_at: string
  time_spent: number
}

// ========== IDEAS ==========
export interface Idea {
  id: number
  title: string
  description: string
  position: number
}

// ========== HABITS ==========
export interface HabitStack {
  id: number
  title: string
  position: number
}

export interface Habit {
  id: number
  stack_id: number
  title: string
  counter: number
  current_streak: number
  best_streak: number
  tag_id: number
  last_month_completed: string[]
  position: number
}

// ========== TAGS ==========
export interface Tag {
  id: number
  title: string
  level: number
  exp_current: number
  exp_needed: number
  time_spent: number
  created_at: string
  position: number
}

// ========== REWARDS ==========
export interface Reward {
  id: number
  title: string
  cost: number
  repeatable: boolean
  position: number
}

// ========== ACHIEVEMENTS ==========
export interface Achievement {
  id: number
  title: string
  description: string
  unlocked: boolean
}

// ========== FULL DB SCHEMA ==========
export interface DbSchema {
  user: User
  questlines: Questline[]
  questlines_done: QuestlineDone[]
  quests: Quest[]
  tasks: Task[]
  tags: Tag[]
  ideas: Idea[]
  habit_stacks: HabitStack[]
  habits: Habit[]
  rewards: Reward[]
  achievements: Achievement[]
}
