<script setup>
// ========== IMPORTS ==========
// Icons
import IdeaIcon from '../assets/idea.svg'
import ArrowIcon from '../assets/arrow.svg'
// Composables
import { useDates } from '../../../shared/helpers/useDate' // Added for isSameDateAsToday
import { useRanks } from '../../../shared/helpers/useRanks'

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
const { getTagRank, getHabitRank, getProjectRank } = useRanks()
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
      <div class="projectRankGems">
        <img
          v-if="getProjectRank(itemData) == 'legendary'"
          src="../assets/LEGENDARY_MARK.png"
          alt="tagIcon"
          class="projectRankMark"
          :class="getProjectRank(itemData) + '-glow'"
        />
        <img
          v-if="getProjectRank(itemData) == 'epic'"
          src="../assets/EPIC_MARK.png"
          alt="tagIcon"
          class="projectRankMark"
          :class="getProjectRank(itemData) + '-glow'"
        />
        <img
          v-if="getProjectRank(itemData) == 'rare'"
          src="../assets/RARE_MARK.png"
          alt="tagIcon"
          class="projectRankMark"
          :class="getProjectRank(itemData) + '-glow'"
        />
        <img
          v-if="getProjectRank(itemData) == 'uncommon'"
          src="../assets/UNCOMMON_MARK.png"
          alt="tagIcon"
          class="projectRankMark"
          :class="getProjectRank(itemData) + '-glow'"
        />
        <img
          v-if="getProjectRank(itemData) == 'common'"
          src="../assets/COMMON_MARK.png"
          alt="tagIcon"
          class="projectRankMark"
          :class="getProjectRank(itemData) + '-glow'"
        />
      </div>
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

    <!-- STACK -->
    <template v-if="itemType === 'habit_stacks'">
      <h2 class="habitStackTitle">{{ itemData.title }}</h2>
    </template>

    <!-- IDEA -->
    <template v-if="itemType === 'ideas'">
      <div class="bulbWrapper">
        <IdeaIcon
          class="bulb"
          @click="emit('idea-to-project')"
        />
      </div>

      <div class="ideaContent">
        <h4>{{ itemData.title }}</h4>
        <p>{{ itemData.description }}</p>
      </div>
    </template>

    <!-- TAG -->
    <template v-if="itemType === 'tags'">
      <div class="rankGems">
        <img
          v-if="getTagRank(itemData) == 'legendary'"
          src="../assets/LEGENDARY_MARK.png"
          alt="tagIcon"
          class="rankMark"
          :class="getTagRank(itemData) + '-glow'"
        />
        <img
          v-if="getTagRank(itemData) == 'epic'"
          src="../assets/EPIC_MARK.png"
          alt="tagIcon"
          class="rankMark"
          :class="getTagRank(itemData) + '-glow'"
        />
        <img
          v-if="getTagRank(itemData) == 'rare'"
          src="../assets/RARE_MARK.png"
          alt="tagIcon"
          class="rankMark"
          :class="getTagRank(itemData) + '-glow'"
        />
        <img
          v-if="getTagRank(itemData) == 'uncommon'"
          src="../assets/UNCOMMON_MARK.png"
          alt="tagIcon"
          class="rankMark"
          :class="getTagRank(itemData) + '-glow'"
        />
        <img
          v-if="getTagRank(itemData) == 'common'"
          src="../assets/COMMON_MARK.png"
          alt="tagIcon"
          class="rankMark"
          :class="getTagRank(itemData) + '-glow'"
        />
      </div>
      <div class="tagContent">
        <div class="cardContent">
          <h4>
            {{ itemData.title }}
          </h4>
          <p class="tagLvl">Level {{ itemData.level }}</p>
        </div>
      </div>
      <progress
        class="expBar"
        :value="itemData.exp_current"
        :max="itemData.exp_needed"
      >
        EXP
      </progress>
    </template>

    <!-- HABIT -->
    <template v-if="itemType === 'habits'">
      <div class="rankGems">
        <img
          v-if="getHabitRank(itemData) == 'legendary'"
          src="../assets/LEGENDARY_MARK.png"
          alt="habitRankIcon"
          class="rankMark"
          :class="getHabitRank(itemData) + '-glow'"
        />
        <img
          v-if="getHabitRank(itemData) == 'epic'"
          src="../assets/EPIC_MARK.png"
          alt="habitRankIcon"
          class="rankMark"
          :class="getHabitRank(itemData) + '-glow'"
        />
        <img
          v-if="getHabitRank(itemData) == 'rare'"
          src="../assets/RARE_MARK.png"
          alt="habitRankIcon"
          class="rankMark"
          :class="getHabitRank(itemData) + '-glow'"
        />
        <img
          v-if="getHabitRank(itemData) == 'uncommon'"
          src="../assets/UNCOMMON_MARK.png"
          alt="habitRankIcon"
          class="rankMark"
          :class="getHabitRank(itemData) + '-glow'"
        />
        <img
          v-if="getHabitRank(itemData) == 'common'"
          src="../assets/COMMON_MARK.png"
          alt="habitRankIcon"
          class="rankMark"
          :class="getHabitRank(itemData) + '-glow'"
        />
      </div>
      <div class="habitCardContent">
        <div class="habitCompletionWrapper">
          <input
            type="checkbox"
            :checked="
              itemData.last_month_completed[itemData.last_month_completed.length - 1] === getToday()
            "
            @change="emit('toggle-completion', itemData)"
            class="habitCheckbox"
          />
          <h4 class="habitTitle">{{ itemData.title }}</h4>
        </div>
        <p class="habitTag">#{{ tagname }}</p>
        <p class="habitStreak">Streak: {{ itemData.current_streak || 0 }}</p>
      </div>
    </template>

    <!-- REWARD -->
    <template v-if="itemType === 'rewards'">
      <div
        class="costWrapper"
        @click="emit('unlock-reward')"
      >
        <img
          src="../assets/crystal.png"
          alt="crystal cost"
        />
        <p>{{ itemData.cost }}</p>
      </div>
      <div class="cardContent">
        <h4>{{ itemData.title }}</h4>
      </div>
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
