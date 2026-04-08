<script setup>
import Dragbar from './components/Dragbar.vue'
import Navigation from './components/Navigation.vue'
import Crystals from './components/Crystals.vue'
import ToastContainer from './components/ToastContainer.vue'
import TimerOverlay from './components/TimerOverlay.vue'
</script>

<template>
  <body>
    <Dragbar />
    <Navigation />
    <Crystals />
    <ToastContainer />
    <TimerOverlay />
    <main>
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </main>
  </body>
</template>

<style scoped lang="scss">
@use './styles/variables.scss' as *;

* {
  margin: 0;
  box-sizing: border-box;
  user-select: none;
}

::-webkit-scrollbar {
  display: none;
}

body {
  background-color: $main-background-color;
  width: 800px;
  overflow-x: hidden;

  main {
    position: absolute;
    left: 150px;

    .moduleWrapper {
      position: absolute;
      margin-top: 10px;
    }
  }
}
</style>
