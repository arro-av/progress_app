import { registerMoveItemHandler } from './handlers/moveItem'
import { registerHabitHandlers } from './handlers/habits'
import { registerTagHandlers } from './handlers/tags'
import { registerRewardHandlers } from './handlers/rewards'
import { registerHabitStackHandlers } from './handlers/habitstacks'
import { registerIdeaHandlers } from './handlers/ideas'
import { registerQuestlineHandlers } from './handlers/questlines'
import { registerQuestHandlers } from './handlers/quests'
import { registerTaskHandlers } from './handlers/tasks.js'
import { registerUserHandlers } from './handlers/user'
import { registerTimerHandlers } from './handlers/timer'

export function registerDBHandlers() {
  registerMoveItemHandler()
  registerTagHandlers()
  registerRewardHandlers()
  registerQuestlineHandlers()
  registerQuestHandlers()
  registerTaskHandlers()
  registerUserHandlers()
  registerTimerHandlers()
}
