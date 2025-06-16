<script setup>
import { onMounted } from 'vue'
import { useUser } from '../helpers/db_functions/useUser'

const {
  exp_current,
  exp_needed,
  level,
  onUserExpUpdate,
  getUserExp,
  onUserLevelUpdate,
  getUserLevel,
} = useUser()

onMounted(async () => {
  getUserExp()
  getUserLevel()

  onUserExpUpdate(() => {
    getUserExp()
  })
  onUserLevelUpdate(() => {
    getUserLevel()
  })
})
</script>

<template>
  <div class="expBarWrapper">
    <p id="userLevel">Level {{ level }}</p>
    <p id="userExp">{{ exp_current }} / {{ exp_needed }}</p>
    <progress
      class="expBar"
      :value="exp_current"
      :max="exp_needed"
    >
      EXP
    </progress>
  </div>
</template>
