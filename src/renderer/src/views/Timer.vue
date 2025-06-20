<script setup>
// ========== IMPORTS ==========
import ModuleTitle from '../components/ModuleTitle.vue'
// Stores
import { useQuestsStore } from '../stores/quests'
import { useTimerStore } from '../stores/timer'
import { storeToRefs } from 'pinia'
// Vue
import { onMounted, onUnmounted, toRaw } from 'vue'
// Helpers
import { useToasts } from '../helpers/composables/useToasts'
const { addToast } = useToasts()
// Constants
import { useCaps } from '../../../shared/constants/useCaps'
const { MAX_TIMER_DURATION, MIN_TIMER_DURATION } = useCaps()

// ========== STORES ==========
const questsStore = useQuestsStore()
const timerStore = useTimerStore()
const { questlines, quests, tasks } = storeToRefs(questsStore)
const { isRunning, timerDuration, timeLeft, formattedTime, progress } = storeToRefs(timerStore)

// ========== LIFECYCLE HOOKS ==========
onMounted(async () => {
  questsStore.init()
  await timerStore.init()
})

onUnmounted(() => {
  questsStore.cleanupListeners()
  timerStore.cleanupListeners()
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
          @input="timerStore.updateTimerDuration($event.target.value)"
          :min="MIN_TIMER_DURATION"
          :max="MAX_TIMER_DURATION"
          class="slider"
          :disabled="isRunning"
        />
      </div>

      <div class="buttons">
        <button
          v-if="!isRunning"
          @click="timerStore.startTimer()"
          class="btn start-btn"
        >
          Start
        </button>
        <button
          v-if="!isRunning"
          @click="
            timerStore
              .manuallyAddTime(toRaw(timerDuration))
              .then(() =>
                addToast({
                  message: `Added ${timerDuration} minutes focused time.`,
                  type: 'success',
                }),
              )
              .catch(() => addToast({ message: 'Failed to add time', type: 'error' }))
          "
          class="btn add-btn"
        >
          +{{ timerDuration }} min
        </button>
        <button
          v-if="isRunning"
          @click="timerStore.resetTimer()"
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
