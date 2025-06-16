<script setup>
// ========== IMPORTS ==========
import ModuleTitle from '../components/ModuleTitle.vue'
// Stores
import { useQuestsStore } from '../stores/quests'
import { storeToRefs } from 'pinia'
// Vue
import { onMounted, onUnmounted, ref, computed, toRaw } from 'vue'
// Helpers
import { useToasts } from '../helpers/composables/useToasts'
const { addToast } = useToasts()

// ========== DATA ==========
const questsStore = useQuestsStore()
const { questlines } = storeToRefs(questsStore)
const { quests } = storeToRefs(questsStore)
const { tasks } = storeToRefs(questsStore)

const isRunning = ref(false)
const timerDuration = ref(25) // in minutes
const timeLeft = ref(25 * 60) // in seconds

// ========== COMPUTED ==========
const formattedTime = computed(() => {
  const minutes = Math.floor(timeLeft.value / 60)
  const seconds = timeLeft.value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

const progress = computed(() => {
  return (timeLeft.value / (timerDuration.value * 60)) * 100
})

// ========== METHODS =========
const startTimer = async () => {
  try {
    await window.api.startTimer()
    isRunning.value = true
  } catch (error) {
    console.error('Failed to start timer:', error)
  }
}

const resetTimer = async () => {
  try {
    await window.api.resetTimer()
    isRunning.value = false
    // Update local state to match
    timeLeft.value = timerDuration.value * 60
  } catch (error) {
    console.error('Failed to reset timer:', error)
  }
}

const updateTimerDuration = (minutes) => {
  const newDuration = parseInt(minutes)
  timerDuration.value = newDuration
  window.api.setTimerDuration(newDuration)
  if (!isRunning.value) {
    timeLeft.value = newDuration * 60
  }
}

const manuallyAddTime = async (minutes) => {
  try {
    await window.api.addTime(minutes)
    addToast({ message: `Added ${minutes} minutes focused time.`, type: 'success' })
  } catch (error) {
    console.error('Failed to add time:', error)
    addToast({ message: 'Failed to add time', type: 'error' })
  }
}

// ========== LIFECYCLE HOOKS ==========
onMounted(async () => {
  questsStore.init()

  // Initialize timer state from main process
  try {
    const state = await window.api.getTimerState()
    if (state) {
      isRunning.value = state.isRunning
      timeLeft.value = state.timeLeft || timerDuration.value * 60
      // Update duration but don't reset the timer if it's running
      if (!isRunning.value) {
        timerDuration.value = Math.floor((state.duration || 25 * 60) / 60)
      }
    }
  } catch (error) {
    console.error('Failed to get timer state:', error)
  }

  // Set up timer event listeners
  const cleanupUpdate = window.api.onTimerUpdate((data) => {
    timeLeft.value = data.timeLeft
  })

  const cleanupComplete = window.api.onTimerComplete(() => {
    isRunning.value = false
    new Notification('Timer finished!')
    // The time is automatically added by the main process
  })

  // Cleanup on component unmount
  return () => {
    cleanupUpdate()
    cleanupComplete()
  }
})

onUnmounted(() => {
  questsStore.cleanupListeners()
})
</script>

<template>
  <ModuleTitle title="Pomodoro Timer" />

  <div class="projects-container">
    <div
      v-if="!isRunning"
      v-for="questline in questlines"
      :key="questline.id"
      class="single-project"
    >
      <h4>{{ questline.title }}</h4>
      <div
        :class="questline.active ? 'checkbox activeCheckbox' : 'checkbox'"
        @click="questsStore.activateQuestline(toRaw(questline))"
      >
        ACTIVE
      </div>
    </div>
    <div
      v-else
      v-for="filteredQuestline in questlines.filter((questline) => questline.active)"
      :key="filteredQuestline.id"
      class="single-project"
    >
      <h4>{{ filteredQuestline.title }}</h4>
    </div>
  </div>

  <div class="timer-container">
    <div class="timer-display">
      <div class="time">{{ formattedTime }}</div>
      <div class="progress-bar">
        <div
          class="progress"
          :style="{ width: `${progress}%` }"
        ></div>
      </div>
    </div>

    <div class="controls">
      <div
        v-if="!isRunning"
        class="slider-container"
      >
        <input
          type="range"
          v-model="timerDuration"
          @input="updateTimerDuration($event.target.value)"
          min="1"
          max="120"
          class="slider"
          :disabled="isRunning"
        />
      </div>

      <div class="buttons">
        <button
          v-if="!isRunning"
          @click="startTimer"
          class="btn start-btn"
        >
          Start
        </button>
        <button
          v-if="!isRunning"
          @click="manuallyAddTime(toRaw(timerDuration))"
          class="btn add-btn"
        >
          +{{ timerDuration }} min
        </button>
        <button
          v-else
          @click="resetTimer"
          class="btn reset-btn"
        >
          Cancel
        </button>
      </div>
      <div v-for="questline in questlines.filter((questline) => questline.active)">
        <div
          v-for="quest in quests.filter(
            (quest) => quest.questline_id === questline.id && quest.position === 0,
          )"
        >
          <div
            v-for="task in tasks
              .filter((task) => task.quest_id === quest.id && task.completed === false)
              .sort((a, b) => a.position - b.position)
              .slice(0, 1)"
          >
            <div class="todo-item-timer">
              <p>{{ task.title }}</p>
              <div
                class="checkbox"
                @click="questsStore.toggleTaskCompletion(toRaw(task))"
              >
                DONE
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
