<script setup>
import ModuleTitle from '../components/ModuleTitle.vue'
import { useUniversals } from '../helpers/db_functions/useUniversals'
import { onMounted, ref } from 'vue'

const { getItems } = useUniversals()

const user = ref({
  balance: 0,
  level: 1,
  exp_current: 0,
  exp_needed: 100,
  focused_time: 0,
  pomodoros: 0,
  projects_done: 0,
  todos_done: 0,
  ideas_total: 0,
  habits_implemented: 0,
  rewards_unlocked: 0,
  exp_gained: 0,
  crystals_gained: 0,
  created_at: '',
})

const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours}h ${minutes}m`
}

onMounted(async () => {
  user.value = await getItems('user')
})
</script>

<template>
  <ModuleTitle title="Statistics" />
  <div class="stats-container">
    <div class="stats-grid">
      <!-- Level & Progress -->
      <div class="stat-card">
        <div class="stat-value">Level {{ user.level }}</div>
        <div class="stat-value">{{ user.exp_current }} / {{ user.exp_needed }} XP</div>
      </div>

      <!-- Balance -->
      <div class="stat-card">
        <div class="stat-value">
          {{ user.crystals_gained }}
          <span class="unit">Crystals</span>
        </div>
        <div class="stat-subtext">Total crystals earned</div>
      </div>

      <!-- Focus Time -->
      <div class="stat-card">
        <div class="stat-value">
          {{ user.focused_time }}
          <span class="unit">Minutes</span>
        </div>
        <div class="stat-subtext">Focused time in {{ user.pomodoros }} sessions</div>
      </div>

      <!-- Projects & Todos -->
      <div class="stat-card">
        <div class="stat-row">
          <div>
            <div class="stat-value">{{ user.projects_done }}</div>
            <div class="stat-label">Projects Done</div>
          </div>
          <div>
            <div class="stat-value">{{ user.todos_done }}</div>
            <div class="stat-label">Todos Done</div>
          </div>
        </div>
      </div>

      <!-- Habits & Rewards -->
      <div class="stat-card">
        <div class="stat-row">
          <div>
            <div class="stat-value">{{ user.habits_implemented }}</div>
            <div class="stat-label">Habits</div>
          </div>
          <div>
            <div class="stat-value">{{ user.rewards_unlocked }}</div>
            <div class="stat-label">Rewards</div>
          </div>
        </div>
      </div>

      <!-- Ideas -->
      <div class="stat-card">
        <div class="stat-value">
          {{ user.ideas_total }}
        </div>
        <div class="stat-subtext">Total ideas captured</div>
      </div>

      <!-- Account -->
      <div class="stat-card">
        <div class="stat-subtext">Created:</div>
        <div class="stat-value">
          {{ user.created_at }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
