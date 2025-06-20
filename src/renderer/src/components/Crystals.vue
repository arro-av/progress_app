<script setup>
import { onMounted, onUnmounted } from 'vue'

// Stores
import { useUserStore } from '../stores/user'
import { storeToRefs } from 'pinia'
// Helpers
import { useToasts } from '../helpers/composables/useToasts'
const { addToast } = useToasts()

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
    <img
      src="../assets/crystal.png"
      alt="Crystal Symbol"
    />
    <p class="balance">
      {{ user.balance }}
    </p>
  </div>
</template>
