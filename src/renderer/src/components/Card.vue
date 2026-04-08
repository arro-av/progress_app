<script setup>
// ========== IMPORTS ==========
// Icons
import IdeaIcon from '../assets/idea.svg'
import ArrowIcon from '../assets/arrow.svg'
import CrystalIcon from '../assets/crystal.svg'
// Composables
import { useDates } from '../../../shared/utils/useDate' // Added for isSameDateAsToday
import { useRanks } from '../../../shared/utils/useRanks'

// ========== DATA ==========
const props = defineProps({
  itemData: {
    type: Object,
    required: true,
  },
  itemType: {
    type: String,
    required: true,
  },
  tagname: {
    type: String,
    required: false,
  },
})

const emit = defineEmits(['move-item', 'unlock-reward', 'idea-to-project', 'toggle-completion']) // Added 'toggle-completion'

const { getToday } = useDates() // Added for checkbox
const { getTagRank, getHabitRank, getQuestlineRank } = useRanks()
</script>

<template>
  <div
    class="cardWrapper"
    :style="{
      filter:
        itemType !== 'questlines' && itemType !== 'habit_stacks' && itemType !== 'quests'
          ? 'drop-shadow(0px 1px 4px rgba(0, 0, 0, 0.2))'
          : '',
    }"
  >
    <!-- QUESTLINE -->
    <template v-if="itemType === 'questlines'">
      <div class="projectCardContent">
        <h2 class="projectTitle">{{ itemData.title }}</h2>
        <p class="projectDescription">{{ itemData.description }}</p>
      </div>
    </template>

    <!-- QUEST -->
    <template v-if="itemType === 'quests'">
      <div class="todoListCardContent">
        <h2 class="habitStackTitle">{{ itemData.title }}</h2>
        <p class="todoListTag">#{{ tagname }}</p>
      </div>
    </template>

    <!-- TASK -->
    <template v-if="itemType === 'tasks'">
      <div class="todoCardContent">
        <div class="todoCompletionWrapper">
          <input
            type="checkbox"
            :checked="itemData.completed"
            @change="emit('toggle-completion', itemData)"
            class="habitCheckbox"
          />
          <h4 class="todoTitle">{{ itemData.title }}</h4>
        </div>
      </div>
    </template>

    <!-- TAG -->

    <!-- REWARD -->
    <template v-if="itemType === 'rewards'">
      <div class="costWrapper">
        <p>{{ itemData.cost }}</p>
        <CrystalIcon class="nav-icon" />
      </div>
      <div class="cardContent">
        <h4>{{ itemData.title }}</h4>
      </div>

      <button @click="emit('unlock-reward')">Unlock</button>
    </template>
    <!-- TODO: Kinda weird on Project Conatiner | Will fix with SCSS refactor in future -->
    <div
      v-if="itemType !== 'questlines'"
      class="moveIconContainer"
    >
      <ArrowIcon
        class="moveIcon moveUpIcon"
        :class="{ nestedMoveUpIcon: itemType === 'habits' || itemType === 'tasks' }"
        @click="emit('move-item', 'up')"
      />
      <ArrowIcon
        class="moveIcon moveDownIcon"
        :class="{ nestedMoveDownIcon: itemType === 'habits' || itemType === 'tasks' }"
        @click="emit('move-item', 'down')"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../styles/variables.scss' as *;
</style>
