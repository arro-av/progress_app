import { createRouter, createWebHistory } from 'vue-router'

import Timer from './views/Timer.vue'
import Projects from './views/Projects.vue'
import Skills from './views/Skills.vue'
import Stats from './views/Stats.vue'
import Rewards from './views/Rewards.vue'
import Progression from './views/Progression.vue'
import Settings from './views/Settings.vue'

const routes = [
  { path: '/', name: 'Timer', component: Timer },
  { path: '/Projects', name: 'Projects', component: Projects },
  { path: '/Skills', name: 'Skills', component: Skills },
  { path: '/Rewards', name: 'Rewards', component: Rewards },
  { path: '/Stats', name: 'Stats', component: Stats },
  { path: '/Settings', name: 'Settings', component: Settings },
  { path: '/Progression', name: 'Progression', component: Progression },
]

const router = createRouter({ history: createWebHistory(), routes })

export default router
