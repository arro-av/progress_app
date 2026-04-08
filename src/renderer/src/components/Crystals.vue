<script setup>
import { onMounted, onUnmounted } from 'vue'
//Icons
import CrystalIcon from '../assets/crystal.svg'
// Stores
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
  <div class="balanceWrapper">
    <CrystalIcon class="crystalIcon" />
    <p class="balance">
      {{ user.balance }}
    </p>
  </div>
</template>

<style lang="scss" scoped>
@use '../styles/variables' as *;

.balanceWrapper {
  display: flex;
  justify-content: space-between;

  width: 65px;

  position: absolute;
  top: 35px;
  right: 40px;

  z-index: 10;

  .crystalIcon {
    position: absolute;
    top: -10px;
    left: -25px;
  }

  p {
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 16px;

    background-color: none;

    color: $accent-color;
  }
}
</style>
