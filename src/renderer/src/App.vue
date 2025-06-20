<script setup>
import Dragbar from './components/Dragbar.vue'
import Navigation from './components/Navigation.vue'
import Crystals from './components/Crystals.vue'
import ExpBar from './components/ExpBar.vue'
import ToastContainer from './components/ToastContainer.vue'
import TimerOverlay from './components/TimerOverlay.vue'
</script>

<template>
  <body>
    <Dragbar />
    <Navigation />
    <Crystals />
    <ExpBar />
    <ToastContainer />
    <TimerOverlay />
    <main>
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </main>
  </body>
</template>
