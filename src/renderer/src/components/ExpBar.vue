<script setup>
import { onMounted, onUnmounted } from 'vue'

import { useUserStore } from '../stores/user'
import { storeToRefs } from 'pinia'

const userStore = useUserStore()
const { user } = storeToRefs(userStore)

onMounted(() => {
  userStore.init()
})

onUnmounted(() => {
  userStore.cleanupListeners()
})
</script>

<template>
  <div class="expBarWrapper">
    <p id="userLevel">Level {{ user.level }}</p>
    <p id="userExp">{{ user.exp_current }} / {{ user.exp_needed }} EXP</p>
    <progress
      class="expBar"
      :value="user.exp_current"
      :max="user.exp_needed"
    >
      EXP
    </progress>
  </div>
</template>

<style scoped lang="scss">
@use '../styles/variables.scss' as *;

.expBarWrapper {
  position: fixed;
  bottom: 20px;
  left: 160px;

  z-index: 100;
  width: 750px;

  #userLevel {
    font-family: Inter, sans-serif;
    font-weight: 600;
    font-size: 14px;
    color: $accent-color;
    text-align: right;
    width: 100%;
    padding-right: 8px;
    opacity: 1;
    margin-bottom: -17px;
  }

  #userExp {
    font-family: Inter, sans-serif;
    font-weight: 600;
    font-size: 12px;
    color: $secondary-text-color;
    text-align: left;
    width: 100%;
    margin-bottom: 12px;
  }

  .expBar {
    width: 100%;
    height: 6px;
    border-radius: 5px;
  }

  progress::-webkit-progress-value {
    background-color: $accent-color;
    border-radius: 10px;
  }

  progress::-moz-progress-bar {
    background-color: $accent-color;
    border-radius: 10px;
  }
}
</style>
