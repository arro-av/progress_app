<script setup>
import TimerIcon from '../assets/timer.svg'
import QuestIcon from '../assets/quest.svg'
import IdeaIcon from '../assets/idea.svg'
import HabitIcon from '../assets/habit.svg'
import TagsIcon from '../assets/tags.svg'
import RewardIcon from '../assets/reward.svg'
import AchievementIcon from '../assets/achievement.svg'
import SettingsIcon from '../assets/settings.svg'
import StatsIcon from '../assets/stats.svg'
</script>

<template>
  <div class="navWrapper">
    <div class="navigation">
      <RouterLink
        v-slot="{ isActive }"
        to="/Stats"
        class="navLink"
      >
        <StatsIcon :class="['nav-icon', { active: isActive }]" />
      </RouterLink>
      <RouterLink
        v-slot="{ isActive }"
        to="/"
        class="navLink"
      >
        <TimerIcon :class="['nav-icon', { active: isActive }]" />
      </RouterLink>
      <RouterLink
        v-slot="{ isActive }"
        to="/Quests"
        class="navLink"
      >
        <QuestIcon :class="['nav-icon', { active: isActive }]" />
      </RouterLink>
      <RouterLink
        v-slot="{ isActive }"
        to="/Ideas"
        class="navLink"
      >
        <IdeaIcon :class="['nav-icon', { active: isActive }]" />
      </RouterLink>
      <RouterLink
        v-slot="{ isActive }"
        to="/Habits"
        class="navLink"
      >
        <HabitIcon :class="['nav-icon', { active: isActive }]" />
      </RouterLink>
      <RouterLink
        v-slot="{ isActive }"
        to="/Tags"
        class="navLink"
      >
        <TagsIcon :class="['nav-icon', { active: isActive }]" />
      </RouterLink>
      <RouterLink
        v-slot="{ isActive }"
        to="/Rewards"
        class="navLink"
      >
        <RewardIcon :class="['nav-icon', { active: isActive }]" />
      </RouterLink>
      <RouterLink
        v-slot="{ isActive }"
        to="/Achievements"
        class="navLink"
      >
        <AchievementIcon :class="['nav-icon', { active: isActive }]" />
      </RouterLink>
    </div>
    <RouterLink
      id="settingsLink"
      v-slot="{ isActive }"
      to="/Settings"
      class="navLink"
    >
      <SettingsIcon :class="['nav-icon', { active: isActive }]" />
    </RouterLink>
  </div>
</template>
