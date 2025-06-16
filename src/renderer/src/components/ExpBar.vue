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
    <p id="userExp">{{ user.exp_current }} / {{ user.exp_needed }}</p>
    <progress
      class="expBar"
      :value="user.exp_current"
      :max="user.exp_needed"
    >
      EXP
    </progress>
  </div>
</template>
