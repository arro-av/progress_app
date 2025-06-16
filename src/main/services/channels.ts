export const IPC_CHANNELS = {
  // ========= GLOBAL =========
  GET_ITEMS: 'get-items',
  MOVE_ITEM: 'move-item',
  DELETE_ITEM: 'delete-item',

  // ========= USER =========
  GET_BALANCE: 'get-balance',
  BALANCE_UPDATED: 'balance-updated',
  GET_USER_EXP: 'get-user-exp',
  USER_EXP_UPDATED: 'user-exp-updated',
  GET_USER_LEVEL: 'get-user-level',
  ADD_TIME: 'add-time',
  USER_LEVEL_UPDATED: 'user-level-updated',

  // ========== QUESTLINES ==========
  GET_QUESTLINES: 'get-questlines',
  ADD_QUESTLINE: 'add-questline',
  EDIT_QUESTLINE: 'edit-questline',
  DELETE_QUESTLINE: 'delete-questline',
  ACTIVATE_QUESTLINE: 'activate-questline',
  CLAIM_QUESTLINE_REWARD: 'claim-questline-reward',
  QUESTLINES_UPDATED: 'questlines-updated',

  // ========== QUESTS ==========
  GET_QUESTS: 'get-quests',
  ADD_QUEST: 'add-quest',
  EDIT_QUEST: 'edit-quest',
  DELETE_QUEST: 'delete-quest',
  ACTIVATE_QUEST: 'activate-quest',
  CLAIM_QUEST_REWARD: 'claim-quest-reward',
  QUESTS_UPDATED: 'quests-updated',

  // ========== TASKS ==========
  GET_TASKS: 'get-tasks',
  ADD_TASK: 'add-task',
  EDIT_TASK: 'edit-task',
  DELETE_TASK: 'delete-task',
  TASKS_UPDATED: 'tasks-updated',
  GET_NEXT_ACTIVE_TASK: 'get-next-active-task',
  TOGGLE_TASK_COMPLETION: 'toggle-task-completion',

  // ========== IDEAS ==========
  GET_IDEAS: 'get-ideas',
  ADD_IDEA: 'add-idea',
  EDIT_IDEA: 'edit-idea',
  DELETE_IDEA: 'delete-idea',
  CONVERT_IDEA_TO_PROJECT: 'convert-idea-to-project',
  IDEAS_UPDATED: 'ideas-updated',

  // ========== HABITS STACK ==========
  GET_HABIT_STACKS: 'get-habit-stacks',
  ADD_HABIT_STACK: 'add-habit-stack',
  EDIT_HABIT_STACK: 'edit-habit-stack',
  DELETE_HABIT_STACK: 'delete-habit-stack',
  HABIT_STACKS_UPDATED: 'habit-stacks-updated',

  // ========== HABITS ==========
  GET_HABITS: 'get-habits',
  ADD_HABIT: 'add-habit',
  EDIT_HABIT: 'edit-habit',
  DELETE_HABIT: 'delete-habit',
  MOVE_NESTED_HABIT: 'move-nested-habit',
  HABITS_UPDATED: 'habits-updated',
  TOGGLE_HABIT_COMPLETION: 'toggle-habit-completion',
  UPDATE_ALL_STREAKS: 'update-all-streaks',

  // ========== TAGS ==========
  GET_TAGS: 'get-tags',
  ADD_TAG: 'add-tag',
  EDIT_TAG: 'edit-tag',
  DELETE_TAG: 'delete-tag',
  TAGS_UPDATED: 'tags-updated',

  // ========== REWARDS ==========
  GET_REWARDS: 'get-rewards',
  ADD_REWARD: 'add-reward',
  EDIT_REWARD: 'edit-reward',
  DELETE_REWARD: 'delete-reward',
  UNLOCK_REWARD: 'redeem-reward',
  REWARDS_UPDATED: 'rewards-updated',
}
