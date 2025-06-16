<script setup>
import ModuleTitle from '../components/ModuleTitle.vue'
import { onMounted, onUnmounted } from 'vue'

// Stores
import { useUserStore } from '../stores/user'
import { storeToRefs } from 'pinia'

const userStore = useUserStore()
const { user } = storeToRefs(userStore)

onMounted(async () => {
  userStore.init()
})

onUnmounted(() => {
  userStore.cleanupListeners()
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
            <div class="stat-value">{{ user.questlines_done }}</div>
            <div class="stat-label">Questlines Completed</div>
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
