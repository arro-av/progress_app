import { createRouter, createWebHistory } from 'vue-router'

import Timer from './views/Timer.vue'
import Quests from './views/Quests.vue'
import Ideas from './views/Ideas.vue'
import Habits from './views/Habits.vue'
import Tags from './views/Tags.vue'
import Stats from './views/Stats.vue'
import Rewards from './views/Rewards.vue'
import Achievements from './views/Achievements.vue'
import Settings from './views/Settings.vue'

const routes = [
  { path: '/', name: 'Timer', component: Timer },
  { path: '/Quests', name: 'Quests', component: Quests },
  { path: '/Ideas', name: 'Ideas', component: Ideas },
  { path: '/Habits', name: 'Habits', component: Habits },
  { path: '/Tags', name: 'Tags', component: Tags },
  { path: '/Stats', name: 'Stats', component: Stats },
  { path: '/Rewards', name: 'Rewards', component: Rewards },
  { path: '/Achievements', name: 'Achievements', component: Achievements },
  { path: '/Settings', name: 'Settings', component: Settings },
]

const router = createRouter({ history: createWebHistory(), routes })

export default router
