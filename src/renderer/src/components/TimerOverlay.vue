<script setup>
import { onMounted, onUnmounted } from 'vue'

// Helpers
import { useToasts } from '../helpers/composables/useToasts'
const { addToast } = useToasts()

let timerNotificationCleanup = null
onMounted(() => {
  timerNotificationCleanup = window.api.onTimerComplete(() => {
    addToast({ message: 'Timer completed!', type: 'success' })
    new Notification('Progress Timer', {
      body: 'Timer completed!',
    })
  })
})

onUnmounted(() => {
  timerNotificationCleanup()
  timerNotificationCleanup = null
})
</script>

<template><!-- TODO: Add timer overlay --></template>
