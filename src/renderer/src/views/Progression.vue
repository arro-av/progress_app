<script setup>
import ModuleTitle from '../components/ModuleTitle.vue'
import ConstructionIcon from '../assets/construction.svg'
import { ref, computed } from 'vue'
import { useXPMultipliers } from '../../../shared/constants/useXPMultipliers'

const { EXP_MULTIPLIER_USER, EXP_MULTIPLIER_TAGS } = useXPMultipliers()

const userData = computed(() => {
  let totalXP = 0
  let totalHours = 0
  return Array.from({ length: 80 }, (_, i) => {
    const xpNeeded = EXP_MULTIPLIER_USER(i)
    const hoursNeeded = xpNeeded / 52
    totalXP += xpNeeded
    totalHours += hoursNeeded
    return {
      level: i + 1,
      xpNeeded,
      totalXP,
      hoursNeeded: hoursNeeded.toFixed(1),
      totalHours: totalHours.toFixed(1),
    }
  })
})

const tagData = computed(() => {
  let totalXP = 0
  let totalHours = 0
  return Array.from({ length: 80 }, (_, i) => {
    const xpNeeded = EXP_MULTIPLIER_TAGS(i)
    const hoursNeeded = xpNeeded / 35
    totalXP += xpNeeded
    totalHours += hoursNeeded
    return {
      level: i + 1,
      xpNeeded,
      totalXP,
      hoursNeeded: hoursNeeded.toFixed(1),
      totalHours: totalHours.toFixed(1),
    }
  })
})
</script>

<template>
  <div class="achievements-container">
    <!-- TODO: Add achievements 
    <ModuleTitle title="Achievements" />
    <ConstructionIcon id="constructionIcon" />-->
    <div class="tables-container">
      <!-- User Progression Table -->
      <div class="table-wrapper">
        <h3>User Progression</h3>
        <div class="table-scroll">
          <table class="progression-table">
            <thead>
              <tr>
                <th>Level</th>
                <th>XP for Next</th>
                <th>Total XP</th>
                <th>Hours Needed</th>
                <th>Total Hours</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in userData"
                :key="'user-' + row.level"
              >
                <td>{{ row.level }}</td>
                <td>{{ row.xpNeeded }}</td>
                <td>{{ row.totalXP }}</td>
                <td>{{ row.hoursNeeded }}</td>
                <td>{{ row.totalHours }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tag Progression Table -->
      <div class="table-wrapper">
        <h3>Tag Progression</h3>
        <div class="table-scroll">
          <table class="progression-table">
            <thead>
              <tr>
                <th>Level</th>
                <th>XP for Next</th>
                <th>Total XP</th>
                <th>Hours Needed</th>
                <th>Total Hours</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in tagData"
                :key="'tag-' + row.level"
              >
                <td>{{ row.level }}</td>
                <td>{{ row.xpNeeded }}</td>
                <td>{{ row.totalXP }}</td>
                <td>{{ row.hoursNeeded }}</td>
                <td>{{ row.totalHours }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.achievements-container {
  padding: 1rem;
}

.tables-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-top: 1.5rem;
  color: white;
  opacity: 0.5;
}

.table-wrapper {
  background: var(--color-background-soft);
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: var(--color-heading);
}

.table-scroll {
  max-height: 70vh;
  overflow-y: auto;
}

.progression-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9em;
}

.progression-table th,
.progression-table td {
  padding: 0.5rem;
  text-align: left;
  border-bottom: 1px solid var(--color-border);
}

.progression-table th {
  position: sticky;
  top: 0;
  background: var(--color-background-mute);
  font-weight: 600;
}

.progression-table tr:hover {
  background-color: var(--color-background-mute);
}
</style>
