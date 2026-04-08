<script setup>
import TimerIcon from '../assets/timer.svg'
import ProjectIcon from '../assets/project.svg'
import SkillIcon from '../assets/skill.svg'
import RewardIcon from '../assets/reward.svg'
import SettingsIcon from '../assets/settings.svg'
import StatsIcon from '../assets/stats.svg'
</script>

<template>
  <div class="navWrapper">
    <div class="navigation">
      <!-- Timer -->
      <RouterLink
        v-slot="{ isActive }"
        to="/"
      >
        <div :class="['navLink', { active: isActive }]">
          <div class="navLinkContent">
            <TimerIcon class="nav-icon" />
            <p>Timer</p>
          </div>

          <div class="navLinkIndicator"></div>
        </div>
      </RouterLink>

      <!-- Projects -->
      <RouterLink
        v-slot="{ isActive }"
        to="/Projects"
      >
        <div :class="['navLink', { active: isActive }]">
          <div class="navLinkContent">
            <ProjectIcon class="nav-icon" />
            <p>Projects</p>
          </div>

          <div class="navLinkIndicator"></div>
        </div>
      </RouterLink>

      <!-- Skills -->
      <RouterLink
        v-slot="{ isActive }"
        to="/Skills"
      >
        <div :class="['navLink', { active: isActive }]">
          <div class="navLinkContent">
            <SkillIcon class="nav-icon" />
            <p>Skills</p>
          </div>

          <div class="navLinkIndicator"></div>
        </div>
      </RouterLink>

      <!-- Rewards -->
      <RouterLink
        v-slot="{ isActive }"
        to="/Rewards"
      >
        <div :class="['navLink', { active: isActive }]">
          <div class="navLinkContent">
            <RewardIcon class="nav-icon" />
            <p>Rewards</p>
          </div>

          <div class="navLinkIndicator"></div>
        </div>
      </RouterLink>

      <!-- Stats -->
      <RouterLink
        v-slot="{ isActive }"
        to="/Stats"
      >
        <div :class="['navLink', { active: isActive }]">
          <div class="navLinkContent">
            <StatsIcon class="nav-icon" />
            <p>Statistics</p>
          </div>

          <div class="navLinkIndicator"></div>
        </div>
      </RouterLink>

      <!-- Progression -->
      <RouterLink
        v-slot="{ isActive }"
        to="/Progression"
      >
        <div :class="['navLink', { active: isActive }]">
          <div class="navLinkContent">
            <SettingsIcon class="nav-icon" />
            <p>Test</p>
          </div>

          <div class="navLinkIndicator"></div>
        </div>
      </RouterLink>

      <!-- Settings -->
      <RouterLink
        id="settingsLink"
        v-slot="{ isActive }"
        to="/Settings"
      >
        <div :class="['navLink', { active: isActive }]">
          <div class="navLinkContent">
            <SettingsIcon class="nav-icon" />
            <p>Settings</p>
          </div>

          <div class="navLinkIndicator"></div>
        </div>
      </RouterLink>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../styles/variables.scss' as *;

a {
  text-decoration: none;
}

.navWrapper {
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  position: fixed;
  top: 0;
  left: 0;

  height: 100%;
  width: 140px;

  z-index: 10;

  background-color: $main-background-color;
  border: none;

  .navigation {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;

    width: 100%;
    height: 55%;
    padding-top: 30px;

    .navLink {
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
      border-radius: 2px;
      width: 120px;
      height: 30px;

      transition: all 0.2s ease;

      .navLinkContent {
        display: flex;
        align-items: center;
        justify-content: center;

        .nav-icon {
          fill: $secondary-text-color;
          opacity: 1;
        }

        p {
          font-family: 'Inter', sans-serif;
          font-weight: 400;
          font-size: 12px;
          display: flex;
          align-items: center;
          padding-left: 5px;
          color: $secondary-text-color;

          transition: all 0.3s ease;
        }
      }

      .navLinkIndicator {
        width: 2px;
        height: 30px;
        background-color: $secondary-accent-color;
        opacity: 0;

        border-radius: 0 2px 2px 0;

        &.active {
          opacity: 1;
        }
      }

      &:hover {
        background-color: rgba($secondary-accent-color, 0.05);

        .nav-icon {
          opacity: 1;
          fill: $secondary-accent-color;
        }

        p {
          color: $secondary-accent-color;
        }
      }

      &.active {
        background-color: rgba($secondary-accent-color, 0.05);

        .navLinkContent {
          .nav-icon {
            fill: $secondary-accent-color;
            opacity: 1;
            filter: drop-shadow(0px 0px 12px rgba(219, 185, 151, 0.35));
          }

          p {
            color: $secondary-accent-color;
            filter: drop-shadow(0px 0px 12px rgba(219, 185, 151, 0.35));
          }
        }

        .navLinkIndicator {
          opacity: 0.6;
          transition: opacity 0.5s ease;
        }
      }
    }

    #settingsLink {
      position: absolute;
      bottom: 5px;
    }
  }
}
</style>
