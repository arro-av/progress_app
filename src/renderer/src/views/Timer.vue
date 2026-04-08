<script setup>
import { computed, onMounted, onUnmounted, ref, toRaw, watch } from 'vue'
import { storeToRefs } from 'pinia'

import ReloadIcon from '../assets/resetTimer.svg'
import PlayIcon from '../assets/play.svg'
import AddTimeIcon from '../assets/addtime.svg'
import CancelIcon from '../assets/cancel.svg'

import { useQuestsStore } from '../stores/quests'
import { useTimerStore } from '../stores/timer'

const questsStore = useQuestsStore()
const timerStore = useTimerStore()

const { questlines, quests } = storeToRefs(questsStore)
const { isRunning, timerDuration, formattedTime, minDuration, maxDuration, defaultDuration } =
  storeToRefs(timerStore)

const selectedQuestlineId = ref(null)
const selectedQuestId = ref(null)

const sortedQuestlines = computed(() =>
  [...questlines.value].sort((a, b) => a.position - b.position),
)

const currentQuestline = computed(
  () =>
    sortedQuestlines.value.find((questline) => questline.id === selectedQuestlineId.value) ??
    sortedQuestlines.value.find((questline) => questline.active) ??
    sortedQuestlines.value[0] ??
    null,
)

const questsInCurrentQuestline = computed(() =>
  quests.value
    .filter((quest) => quest.questline_id === currentQuestline.value?.id)
    .sort((a, b) => a.position - b.position),
)

const currentQuest = computed(
  () =>
    questsInCurrentQuestline.value.find((quest) => quest.id === selectedQuestId.value) ??
    questsInCurrentQuestline.value.find((quest) => quest.active) ??
    questsInCurrentQuestline.value[0] ??
    null,
)

const hasActiveSelection = computed(() => Boolean(currentQuestline.value && currentQuest.value))

const selectQuestline = async (questlineId) => {
  const questline = sortedQuestlines.value.find((entry) => entry.id === Number(questlineId))
  if (!questline) return

  selectedQuestlineId.value = questline.id

  if (!questline.active) {
    await questsStore.activateQuestline(toRaw(questline))
  }

  const nextQuest =
    quests.value.find((quest) => quest.questline_id === questline.id && quest.active) ??
    quests.value
      .filter((quest) => quest.questline_id === questline.id)
      .sort((a, b) => a.position - b.position)[0]

  if (nextQuest) {
    selectedQuestId.value = nextQuest.id
    if (!nextQuest.active) {
      await questsStore.activateQuest(toRaw(nextQuest))
    }
  } else {
    selectedQuestId.value = null
  }
}

const selectQuest = async (questId) => {
  const quest = questsInCurrentQuestline.value.find((entry) => entry.id === Number(questId))
  if (!quest) return

  selectedQuestId.value = quest.id

  if (!quest.active) {
    await questsStore.activateQuest(toRaw(quest))
  }
}

const handlePlay = async () => {
  if (!hasActiveSelection.value) return
  await timerStore.startTimer()
}

const handleCancel = async () => {
  await timerStore.cancelTimer()
}

const handleAddTime = async () => {
  if (!hasActiveSelection.value) return
  await timerStore.manuallyAddTime(timerDuration.value)
}

onMounted(async () => {
  await questsStore.init()
  await timerStore.init()

  if (!isRunning.value) {
    await timerStore.refreshTimer()
  }
})

onUnmounted(() => {
  questsStore.cleanupListeners()
  timerStore.cleanupListeners()
})

watch(
  sortedQuestlines,
  (nextQuestlines) => {
    if (nextQuestlines.length === 0) {
      selectedQuestlineId.value = null
      return
    }

    const currentStillExists = nextQuestlines.some(
      (questline) => questline.id === selectedQuestlineId.value,
    )

    if (!currentStillExists) {
      selectedQuestlineId.value =
        nextQuestlines.find((questline) => questline.active)?.id ?? nextQuestlines[0].id
    }
  },
  { immediate: true },
)

watch(
  questsInCurrentQuestline,
  (nextQuests) => {
    if (nextQuests.length === 0) {
      selectedQuestId.value = null
      return
    }

    const currentStillExists = nextQuests.some((quest) => quest.id === selectedQuestId.value)

    if (!currentStillExists) {
      selectedQuestId.value = nextQuests.find((quest) => quest.active)?.id ?? nextQuests[0].id
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="timerView">
    <div
      v-if="!isRunning"
      class="timerToolbar"
    >
      <div class="timerSelect">
        <select
          :value="selectedQuestlineId ?? ''"
          @change="selectQuestline($event.target.value)"
        >
          <option
            v-if="sortedQuestlines.length === 0"
            value=""
          >
            No Projects
          </option>
          <option
            v-for="questline in sortedQuestlines"
            :key="questline.id"
            :value="questline.id"
          >
            {{ questline.title }}
          </option>
        </select>
      </div>

      <div class="timerSelect">
        <select
          :value="selectedQuestId ?? ''"
          :disabled="questsInCurrentQuestline.length === 0"
          @change="selectQuest($event.target.value)"
        >
          <option
            v-if="questsInCurrentQuestline.length === 0"
            value=""
          >
            No Epics
          </option>
          <option
            v-for="quest in questsInCurrentQuestline"
            :key="quest.id"
            :value="quest.id"
          >
            {{ quest.title }}
          </option>
        </select>
      </div>
    </div>

    <section
      class="timerStage"
      :class="{ running: isRunning }"
    >
      <div class="timerCore">
        <div class="timerDisplay">
          {{ formattedTime }}
        </div>

        <div
          v-if="!isRunning"
          class="timerSliderWrap"
        >
          <input
            type="range"
            class="timerSlider"
            :min="minDuration"
            :max="maxDuration"
            :value="timerDuration"
            @input="timerStore.updateTimerDuration($event.target.value)"
          />
        </div>

        <div
          v-if="!isRunning"
          class="timerActions"
        >
          <button
            class="timerActionButton secondary"
            :disabled="timerDuration === defaultDuration"
            title="Reset to Default"
            @click="timerStore.refreshTimer()"
          >
            <ReloadIcon class="timerActionIcon" />
          </button>

          <button
            class="timerActionButton primary"
            :disabled="!hasActiveSelection"
            title="Start Timer"
            @click="handlePlay"
          >
            <PlayIcon class="timerActionIcon" />
          </button>

          <button
            class="timerActionButton secondary"
            :disabled="!hasActiveSelection"
            title="Add Time Directly"
            @click="handleAddTime"
          >
            <AddTimeIcon class="timerActionIcon" />
          </button>
        </div>

        <div
          v-else
          class="timerRunningActions"
        >
          <button
            class="timerActionButton cancel"
            title="Cancel Timer"
            @click="handleCancel"
          >
            <CancelIcon class="timerActionIcon" />
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
@use '../styles/variables.scss' as *;

.timerView {
  margin-top: 40px;
}

.timerToolbar {
  width: 520px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.timerSelect {
  position: relative;
  height: 40px;
  border-radius: 2px;
  overflow: hidden;
  background-color: $card-background-color;

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    right: 14px;
    width: 8px;
    height: 8px;
    border-right: 1px solid rgba($accent-color, 0.9);
    border-bottom: 1px solid rgba($accent-color, 0.9);
    transform: translateY(-70%) rotate(45deg);
    pointer-events: none;
  }

  select {
    width: 100%;
    height: 100%;
    border: none;
    outline: none;
    padding: 0 36px 0 12px;
    background: transparent;
    color: $accent-color;
    font-family: 'Inter', sans-serif;
    font-size: 15px;
    font-weight: 500;
    appearance: none;
    cursor: pointer;
  }

  select:disabled {
    color: $secondary-text-color;
    cursor: not-allowed;
  }
}

.timerStage {
  width: 520px;
  min-height: 520px;
  display: flex;
  align-items: center;
  justify-content: center;

  position: absolute;
  left: 100px;

  &.running {
    min-height: 600px;
  }
}

.timerCore {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.timerDisplay {
  font-family: 'Inter', sans-serif;
  font-size: 180px;
  font-weight: 100;
  line-height: 0.9;
  letter-spacing: -0.05em;
  color: $primary-text-color;
}

.timerSliderWrap {
  width: 300px;
  margin-top: 26px;
}

.timerSlider {
  width: 100%;
  appearance: none;
  background: transparent;
  cursor: pointer;

  &::-webkit-slider-runnable-track {
    height: 3px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.08);
  }

  &::-webkit-slider-thumb {
    appearance: none;
    width: 10px;
    height: 10px;
    margin-top: -3px;
    border: none;
    border-radius: 50%;
    background: $accent-color;
    box-shadow: 0 0 0 4px rgba($accent-color, 0.14);
  }
}

.timerActions,
.timerRunningActions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 22px;
}

.timerActionButton {
  width: 60px;
  height: 60px;
  border: none;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    opacity 0.2s ease,
    background-color 0.2s ease;

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    transform: translateY(-1px);
  }

  &.primary {
    width: 80px;
    height: 80px;
    background-color: $accent-color;

    .timerActionIcon {
      fill: $main-background-color;
    }
  }

  &.secondary {
    background-color: rgba(255, 255, 255, 0.04);

    .timerActionIcon {
      fill: rgba(255, 255, 255, 0.42);
    }
  }

  &.cancel {
    width: 56px;
    height: 56px;
    background-color: rgba(220, 80, 80, 0.14);

    .timerActionIcon {
      fill: #d85f5f;
    }
  }
}

.timerActionIcon {
  width: 16px;
  height: 16px;
}

option {
  background-color: $main-background-color;
  color: $primary-text-color;
}
</style>
