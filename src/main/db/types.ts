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
  rewards_unlocked: number
  exp_gained: number
  crystals_gained: number
  created_at: string
}

// ========== YEARS ========== Used for heatmap -> stores time spent per day in minutes
export interface Year {
  year: number
  time: number[]
}

// ========== SETTINGS ==========
export interface Settings {
  timer_min: number
  timer_max: number
  timer_default_session: number

  currency_crysral_ratio: number[]
  max_projects: number
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

// ========== Story ==========
export interface Quest {
  id: number
  title: string
  time_spent: number
  questline_id: number
  tag_id_1: number
  tag_id_2: number | null
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
  status: boolean
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

// ========== FULL DB SCHEMA ==========
export interface DbSchema {
  user: User
  settings: Settings
  years: Year[]
  questlines: Questline[]
  questlines_done: QuestlineDone[]
  quests: Quest[]
  tasks: Task[]
  tags: Tag[]
  rewards: Reward[]
}
