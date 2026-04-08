<script setup>
const minimize = () => window.api.windowControl('minimize')
const close = () => window.api.windowControl('close')
</script>

<template>
  <div class="dragBar">
    <div class="progressLogo">
      <img
        src="../assets/crystal.png"
        alt="Progress Logo"
        width="20px"
      />
      <p>Progress</p>
    </div>
    <div class="windowControls">
      <button
        id="min"
        @click="minimize"
      >
        –
      </button>
      <button
        id="close"
        @click="close"
      >
        ✕
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../styles/variables.scss' as *;

.dragBar {
  height: 30px;
  width: 100vw;
  -webkit-app-region: drag;
  display: flex;
  justify-content: space-between;
  background: $main-background-color;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  border: none;

  .progressLogo {
    display: flex;
    align-items: center;
    gap: 10px;
    padding-left: 5px;
    padding-top: 1px;

    img {
      width: 20px;
      filter: drop-shadow(0px 0px 12px rgba(219, 185, 151, 0.35));
    }

    p {
      font-family: 'Cinzel', sans-serif;
      font-weight: 600;
      font-size: 14px;
      color: $accent-color;
      filter: drop-shadow(0px 0px 15px rgba(219, 185, 151, 0.35));
      position: relative;
      left: -5px;
      top: 1px;
    }
  }

  .windowControls {
    display: flex;
    -webkit-app-region: no-drag;

    button {
      background: transparent;
      border: none;
      color: $accent-color;
      padding: 0 15px;
      cursor: pointer;
      opacity: 0.25;
      transform: scale(1.15);

      &:hover {
        opacity: 1;
        transition: opacity 0.3s;
      }
    }
  }
}
</style>
