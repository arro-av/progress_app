<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'

import ModuleTitle from '../components/ModuleTitle.vue'
import ArrowIcon from '../assets/arrow.svg'

import { useSettingsStore } from '../stores/settings'
import { useToasts } from '../helpers/composables/useToasts'

const settingsStore = useSettingsStore()
const { addToast } = useToasts()
const { settings, loading } = storeToRefs(settingsStore)

const draftSettings = ref({
  timer_min: 2,
  timer_max: 120,
  timer_default_session: 25,
})

const isSaving = ref(false)
const isResetting = ref(false)
const isExporting = ref(false)

watch(
  settings,
  (nextSettings) => {
    draftSettings.value = {
      timer_min: nextSettings.timer_min ?? 2,
      timer_max: nextSettings.timer_max ?? 120,
      timer_default_session: nextSettings.timer_default_session ?? 25,
    }
  },
  { immediate: true, deep: true },
)

const saveTimerSettings = async () => {
  if (isSaving.value) return

  isSaving.value = true

  try {
    const result = await settingsStore.updateTimerSettings({
      timer_min: Number(draftSettings.value.timer_min),
      timer_max: Number(draftSettings.value.timer_max),
      timer_default_session: Number(draftSettings.value.timer_default_session),
    })

    addToast({
      message: result.message,
      type: result.success ? 'success' : 'error',
    })
  } catch (error) {
    console.error('Failed to update timer settings:', error)
    addToast({ message: 'Failed to update timer settings', type: 'error' })
  } finally {
    isSaving.value = false
  }
}

const resetDefaults = async () => {
  if (isResetting.value) return

  isResetting.value = true

  try {
    const result = await settingsStore.resetTimerSettings()

    addToast({
      message: result.message,
      type: result.success ? 'success' : 'error',
    })
  } catch (error) {
    console.error('Failed to reset timer settings:', error)
    addToast({ message: 'Failed to reset timer settings', type: 'error' })
  } finally {
    isResetting.value = false
  }
}

const exportBackup = async () => {
  if (isExporting.value) return

  isExporting.value = true

  try {
    const result = await settingsStore.exportDbJson()

    if (result.success) {
      addToast({ message: result.message, type: 'success' })
      return
    }

    if (result.message !== 'Backup export cancelled') {
      addToast({ message: result.message || 'Failed to export backup', type: 'error' })
    }
  } catch (error) {
    console.error('Failed to export backup:', error)
    addToast({ message: 'Failed to export backup', type: 'error' })
  } finally {
    isExporting.value = false
  }
}

onMounted(async () => {
  await settingsStore.init()
})

onUnmounted(() => {
  settingsStore.cleanup()
})
</script>

<template>
  <div class="settings-view">
    <div class="settings-toolbar">
      <button
        class="settings-action"
        :disabled="isResetting || loading"
        @click="resetDefaults"
      >
        <span>{{ isResetting ? 'Resetting...' : 'Reset Default' }}</span>
        <ArrowIcon class="settings-action__icon" />
      </button>
    </div>

    <div class="settings-grid">
      <section class="settings-card settings-card--timer">
        <p class="settings-card__eyebrow">TIMER SETTINGS</p>
        <h2 class="settings-card__title">Only editable system values</h2>
        <p class="settings-card__copy">
          Adjust the timer limits and the default session length used across the app.
        </p>

        <div class="settings-fields">
          <label class="settings-field">
            <span>Minimum Minutes</span>
            <input
              v-model.number="draftSettings.timer_min"
              type="number"
              min="2"
              max="120"
            />
          </label>

          <label class="settings-field">
            <span>Maximum Minutes</span>
            <input
              v-model.number="draftSettings.timer_max"
              type="number"
              min="2"
              max="120"
            />
          </label>

          <label class="settings-field">
            <span>Default Session</span>
            <input
              v-model.number="draftSettings.timer_default_session"
              type="number"
              min="2"
              max="120"
            />
          </label>
        </div>

        <button
          class="settings-save"
          :disabled="isSaving || loading"
          @click="saveTimerSettings"
        >
          {{ isSaving ? 'Saving...' : 'Save Settings' }}
        </button>
      </section>

      <section class="settings-card settings-card--backup">
        <p class="settings-card__eyebrow">DATABASE BACKUP</p>
        <h2 class="settings-card__title">Export current DB as JSON</h2>
        <p class="settings-card__copy">
          Creates a backup copy of the current
          <strong>dev-db.json</strong>
          so you can store it elsewhere safely.
        </p>

        <div class="settings-backup__source">
          <span>Source File</span>
          <code>userData/dev-db.json</code>
        </div>

        <button
          class="settings-export"
          :disabled="isExporting"
          @click="exportBackup"
        >
          {{ isExporting ? 'Exporting...' : 'Export JSON Backup' }}
        </button>
      </section>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../styles/variables.scss' as *;

.settings-view {
  width: 610px;
  padding-right: 10px;
}

.settings-toolbar {
  margin-top: 40px;
}

.settings-action {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 250px;
  height: 40px;
  padding: 0 8px;
  border: none;
  border-radius: 2px;
  background-color: $card-background-color;
  transition: all 0.3s ease;

  span {
    font-family: 'Inter', sans-serif;
    font-size: 16px;
    font-weight: 400;
    color: $accent-color;
  }

  &:disabled {
    cursor: wait;
    opacity: 0.65;
  }

  &:hover:not(:disabled) {
    background-color: $accent-color;

    span {
      color: $main-background-color;
    }

    .settings-action__icon {
      fill: $main-background-color;
      opacity: 1;
    }
  }
}

.settings-action__icon {
  width: fit-content;
  height: fit-content;
  fill: $accent-color;
  opacity: 0.85;
  transform: rotate(180deg);
  transition: fill 0.3s ease;

  scale: 0.75;
  rotate: 180deg;
}

.settings-grid {
  display: grid;
  grid-template-columns: 350px 250px;
  gap: 10px;
  margin-top: 20px;
}

.settings-card {
  min-height: 255px;
  padding: 16px 16px 14px;
  border-radius: 8px;
  background-color: $card-background-color;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.015);
}

.settings-card__eyebrow,
.settings-field span,
.settings-backup__source span {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 700;
  color: $secondary-text-color;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.settings-card__title {
  margin-top: 8px;
  font-family: 'Anek Devanagari', sans-serif;
  font-size: 32px;
  font-weight: 600;
  line-height: 0.95;
  color: $common-color;
}

.settings-card__copy {
  margin-top: 10px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  line-height: 1.45;
  color: $secondary-text-color;

  strong {
    color: $accent-color;
    font-weight: 700;
  }
}

.settings-fields {
  display: grid;
  gap: 12px;
  margin-top: 18px;
}

.settings-field {
  display: flex;
  flex-direction: column;
  gap: 6px;

  input {
    width: 100%;
    height: 40px;
    border: none;
    border-radius: 5px;
    padding: 0 12px;
    background: rgba(255, 255, 255, 0.04);
    color: $common-color;
    font-family: 'Inter', sans-serif;
    font-size: 15px;
    font-weight: 600;
    outline: none;
  }
}

.settings-save,
.settings-export {
  width: 100%;
  height: 42px;
  margin-top: 18px;
  border: none;
  border-radius: 5px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    opacity 0.2s ease,
    background-color 0.2s ease;

  &:disabled {
    cursor: wait;
    opacity: 0.65;
  }

  &:hover:not(:disabled) {
    transform: translateY(-1px);
  }
}

.settings-save {
  background: rgba($accent-color, 0.92);
  color: $main-background-color;
}

.settings-backup__source {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 18px;
  padding: 12px;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.03);

  code {
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: $accent-color;
  }
}

.settings-export {
  background: rgba(255, 255, 255, 0.04);
  color: $common-color;
}

@media (max-width: 768px) {
  .settings-view {
    width: 100%;
    padding-right: 0;
  }

  .settings-grid {
    grid-template-columns: 1fr;
  }
}
</style>
