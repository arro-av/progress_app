<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'

import ArrowIcon from '../assets/arrow.svg'
import CrystalIcon from '../assets/crystal.svg'

import { useStatsStore } from '../stores/stats'
import { useToasts } from '../helpers/composables/useToasts'

const ACCENT_RGB = '233, 193, 118'
const WEEKDAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
const MONTH_LABELS = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC',
]
const RANK_COLORS = {
  common: '#ffffff',
  uncommon: '#4caf50',
  rare: '#0070dd',
  epic: '#a335ee',
  legendary: '#ff8000',
  mythic: '#ff0080',
}

const numberFormatter = new Intl.NumberFormat('de-DE')
const dateFormatter = new Intl.DateTimeFormat('de-AT', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const statsStore = useStatsStore()
const { addToast } = useToasts()
const { snapshot, loading } = storeToRefs(statsStore)

const selectedYear = ref(new Date().getFullYear())
const isExporting = ref(false)

const isLeapYear = (year) => year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)

const getStorageDayIndex = (date) => {
  const startOfYear = new Date(date.getFullYear(), 0, 1)
  const currentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const millisecondsPerDay = 24 * 60 * 60 * 1000
  let dayIndex = Math.floor((currentDate.getTime() - startOfYear.getTime()) / millisecondsPerDay)

  if (isLeapYear(date.getFullYear()) && date.getMonth() > 1) {
    dayIndex -= 1
  }

  return Math.max(0, Math.min(364, dayIndex))
}

const getMondayIndex = (date) => (date.getDay() + 6) % 7

const getStartOfWeek = (date) => {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - getMondayIndex(start))
  return start
}

const isSameDay = (left, right) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate()

const formatNumber = (value) => numberFormatter.format(value ?? 0)

const formatDate = (value) => {
  if (!value) return '--.--.----'

  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) return value

  return dateFormatter.format(parsedDate)
}

const formatMinutesDetailed = (minutes) => {
  const safeMinutes = Math.max(0, Math.floor(minutes ?? 0))
  const hours = Math.floor(safeMinutes / 60)
  const restMinutes = safeMinutes % 60
  return `${formatNumber(hours)}h ${String(restMinutes).padStart(2, '0')}m`
}

const formatMinutesShort = (minutes) => {
  const safeMinutes = Math.max(0, Math.floor(minutes ?? 0))
  if (safeMinutes < 60) return `${safeMinutes}m`

  const hours = Math.floor(safeMinutes / 60)
  const restMinutes = safeMinutes % 60
  return restMinutes === 0 ? `${hours}h` : `${hours}h ${restMinutes}m`
}

const getTagRank = (tag) => {
  if (tag.level > 76) return 'mythic'
  if (tag.level > 64) return 'legendary'
  if (tag.level > 48) return 'epic'
  if (tag.level > 28) return 'rare'
  if (tag.level > 12) return 'uncommon'
  return 'common'
}

const getProjectRank = (project) => {
  if (project.time_spent >= 4800) return 'mythic'
  if (project.time_spent >= 2400) return 'legendary'
  if (project.time_spent >= 1200) return 'epic'
  if (project.time_spent >= 480) return 'rare'
  if (project.time_spent >= 120) return 'uncommon'
  return 'common'
}

const getHeatOpacity = (minutes) => {
  if (minutes >= 120) return 1
  if (minutes >= 60) return 0.7
  if (minutes >= 25) return 0.4
  if (minutes >= 2) return 0.2
  return 0
}

const getHeatBackground = (minutes) => {
  const opacity = getHeatOpacity(minutes)
  return opacity > 0 ? `rgba(${ACCENT_RGB}, ${opacity})` : 'rgba(255, 255, 255, 0.04)'
}

const getMinutesForDate = (date) => {
  const yearEntry = snapshot.value.years.find((year) => year.year === date.getFullYear())
  if (!yearEntry) return 0
  return yearEntry.time?.[getStorageDayIndex(date)] ?? 0
}

const now = computed(() => new Date())

const weekDays = computed(() => {
  const start = getStartOfWeek(now.value)

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)

    return {
      key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
      label: WEEKDAY_LABELS[index],
      date,
      minutes: getMinutesForDate(date),
      isToday: isSameDay(date, now.value),
    }
  })
})

const previousWeekDays = computed(() => {
  const previousStart = getStartOfWeek(now.value)
  previousStart.setDate(previousStart.getDate() - 7)

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(previousStart)
    date.setDate(previousStart.getDate() + index)

    return {
      date,
      minutes: getMinutesForDate(date),
    }
  })
})

const currentWeekTotal = computed(() =>
  weekDays.value.reduce((total, day) => total + day.minutes, 0),
)

const currentWeekPeak = computed(() => Math.max(...weekDays.value.map((day) => day.minutes), 1))

const weekProgressIndex = computed(() => getMondayIndex(now.value))

const currentWeekProgress = computed(() =>
  weekDays.value
    .slice(0, weekProgressIndex.value + 1)
    .reduce((total, day) => total + day.minutes, 0),
)

const previousWeekProgress = computed(() =>
  previousWeekDays.value
    .slice(0, weekProgressIndex.value + 1)
    .reduce((total, day) => total + day.minutes, 0),
)

const weekTrend = computed(() => {
  const currentValue = currentWeekProgress.value
  const previousValue = previousWeekProgress.value

  if (currentValue === 0 && previousValue === 0) {
    return {
      delta: 0,
      direction: 'neutral',
      label: 'same point last week',
    }
  }

  if (previousValue === 0) {
    return {
      delta: 100,
      direction: 'positive',
      label: 'more than last week',
    }
  }

  const difference = ((currentValue - previousValue) / previousValue) * 100

  return {
    delta: Math.abs(difference),
    direction: difference >= 0 ? 'positive' : 'negative',
    label: difference >= 0 ? 'better than last week' : 'less than last week',
  }
})

const currentWeekNumber = computed(() => {
  const date = new Date(now.value)
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() + 4 - (date.getDay() || 7))

  const yearStart = new Date(date.getFullYear(), 0, 1)
  return Math.ceil(((date - yearStart) / 86400000 + 1) / 7)
})

const sortedTags = computed(() =>
  [...snapshot.value.tags].sort((left, right) => right.time_spent - left.time_spent),
)

const totalProjects = computed(
  () => snapshot.value.questlines.length + snapshot.value.questlines_done.length,
)

const rankedProjects = computed(() => {
  const activeProjects = snapshot.value.questlines.map((questline) => ({
    id: `questline-${questline.id}`,
    name: questline.title,
    time_spent: questline.time_spent,
  }))

  const archivedProjects = snapshot.value.questlines_done.map((questline) => ({
    id: `questline-done-${questline.id}`,
    name: questline.name,
    time_spent: questline.time_spent,
  }))

  return [...activeProjects, ...archivedProjects].sort(
    (left, right) => right.time_spent - left.time_spent,
  )
})

const completedProjects = computed(
  () => snapshot.value.questlines_done.filter((project) => project.status).length,
)

const cancelledProjects = computed(
  () => snapshot.value.questlines_done.filter((project) => !project.status).length,
)

const completedProjectShare = computed(() => {
  const total = completedProjects.value + cancelledProjects.value
  if (total === 0) return 0
  return (completedProjects.value / total) * 100
})

const cancelledProjectShare = computed(() => {
  const total = completedProjects.value + cancelledProjects.value
  if (total === 0) return 0
  return (cancelledProjects.value / total) * 100
})

const availableYears = computed(() => {
  const nonEmptyYears = snapshot.value.years.filter((year) =>
    year.time?.some((minutes) => minutes > 0),
  )

  const sourceYears = nonEmptyYears.length ? nonEmptyYears : snapshot.value.years

  return [...sourceYears].sort((left, right) => right.year - left.year)
})

watch(
  availableYears,
  (years) => {
    if (!years.length) {
      selectedYear.value = new Date().getFullYear()
      return
    }

    if (!years.some((year) => year.year === selectedYear.value)) {
      selectedYear.value = years[0].year
    }
  },
  { immediate: true },
)

const selectedYearEntry = computed(() => {
  const fallbackYear = selectedYear.value || new Date().getFullYear()

  return (
    snapshot.value.years.find((year) => year.year === selectedYear.value) ?? {
      year: fallbackYear,
      time: Array(365).fill(0),
    }
  )
})

const selectedYearDates = computed(() => {
  const dates = []
  const currentDate = new Date(selectedYearEntry.value.year, 0, 1)

  while (currentDate.getFullYear() === selectedYearEntry.value.year) {
    if (!(currentDate.getMonth() === 1 && currentDate.getDate() === 29)) {
      dates.push(new Date(currentDate))
    }

    currentDate.setDate(currentDate.getDate() + 1)
  }

  return dates
})

const heatmapLeadingEmpty = computed(() =>
  selectedYearDates.value.length ? getMondayIndex(selectedYearDates.value[0]) : 0,
)

const heatmapColumns = computed(() =>
  Math.max(1, Math.ceil((heatmapLeadingEmpty.value + selectedYearDates.value.length) / 7)),
)

const heatmapMonthLabels = computed(() =>
  MONTH_LABELS.map((label, monthIndex) => {
    const monthStartIndex = selectedYearDates.value.findIndex(
      (date) => date.getMonth() === monthIndex && date.getDate() === 1,
    )

    return {
      label,
      column:
        monthStartIndex < 0 ? 1 : Math.floor((heatmapLeadingEmpty.value + monthStartIndex) / 7) + 1,
    }
  }),
)

const activeDaysInSelectedYear = computed(
  () => selectedYearEntry.value.time.filter((minutes) => minutes > 0).length,
)

const heatmapCells = computed(() => {
  const cells = Array.from({ length: heatmapLeadingEmpty.value }, (_, index) => ({
    id: `empty-${index}`,
    empty: true,
  }))

  selectedYearDates.value.forEach((date, index) => {
    const minutes = selectedYearEntry.value.time?.[index] ?? 0

    cells.push({
      id: `${selectedYearEntry.value.year}-${index}`,
      empty: false,
      date,
      minutes,
      isToday: isSameDay(date, now.value),
      backgroundColor: getHeatBackground(minutes),
    })
  })

  return cells
})

const heatmapLegend = [
  { key: 'less', opacity: 0 },
  { key: 'low', opacity: 0.2 },
  { key: 'medium', opacity: 0.4 },
  { key: 'high', opacity: 0.7 },
  { key: 'full', opacity: 1 },
]

const formatHeatmapTooltip = (cell) => {
  if (cell.empty || !cell.date) return ''

  return `${formatDate(cell.date)} • ${formatMinutesShort(cell.minutes)} focused`
}

const exportStatistics = async () => {
  if (isExporting.value) return

  isExporting.value = true
  document.body.classList.add('stats-exporting')

  try {
    await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 120))

    const result = await statsStore.exportStatsPdf()

    if (result.success) {
      addToast({ message: 'Statistics exported as PDF!', type: 'success' })
      return
    }

    if (result.message !== 'PDF export cancelled') {
      addToast({ message: result.message || 'PDF export failed', type: 'error' })
    }
  } catch (error) {
    console.error('Statistics PDF export failed:', error)
    addToast({ message: 'PDF export failed', type: 'error' })
  } finally {
    document.body.classList.remove('stats-exporting')
    isExporting.value = false
  }
}

onMounted(async () => {
  await statsStore.init()
})

onUnmounted(() => {
  statsStore.cleanup()
  document.body.classList.remove('stats-exporting')
})
</script>

<template>
  <div class="stats-view">
    <div class="stats-toolbar">
      <button
        class="stats-action"
        :disabled="isExporting || loading"
        @click="exportStatistics"
      >
        <span>{{ isExporting ? 'Exporting...' : 'Export PDF' }}</span>
        <ArrowIcon class="stats-action__icon" />
      </button>
    </div>

    <div class="stats-grid">
      <section class="stats-card stats-card--user">
        <div class="stats-card__header">
          <div>
            <h2 class="stats-user__name">Bob</h2>
            <p class="stats-user__level">LEVEL {{ snapshot.user.level }}</p>
          </div>
          <div class="stats-user__meta">
            <span>ACTIVE SINCE: {{ formatDate(snapshot.user.created_at) }}</span>
          </div>
        </div>

        <div class="stats-user__progress">
          <div class="stats-user__numbers">
            <span class="stats-user__xp-current">
              {{ formatNumber(snapshot.user.exp_current) }}
            </span>
            <span class="stats-user__xp-needed">
              | {{ formatNumber(snapshot.user.exp_needed) }} EXP
            </span>
          </div>

          <div class="stats-progress">
            <div
              class="stats-progress__fill"
              :style="{
                width: `${Math.min(
                  100,
                  snapshot.user.exp_needed
                    ? (snapshot.user.exp_current / snapshot.user.exp_needed) * 100
                    : 0,
                )}%`,
              }"
            ></div>
          </div>
        </div>
      </section>

      <section class="stats-card stats-card--overview">
        <div class="stats-overview__item">
          <div class="stats-overview__label">TOTAL CRYSTALS EARNED</div>
          <div class="stats-overview__value">
            <span>{{ formatNumber(snapshot.user.crystals_gained) }}</span>
          </div>
        </div>

        <div class="stats-overview__item">
          <div class="stats-overview__label">TOTAL EXPERIENCE GATHERED</div>
          <div class="stats-overview__value stats-overview__value--xp">
            <span>{{ formatNumber(snapshot.user.exp_gained) }}</span>
          </div>
        </div>
      </section>

      <section class="stats-card stats-card--focus">
        <div class="stats-section__top">
          <div>
            <p class="stats-card__eyebrow">FOCUS TIME PER WEEK</p>
            <div class="stats-card__hero">
              <span>{{ formatMinutesDetailed(currentWeekTotal) }}</span>
            </div>
          </div>

          <div class="stats-section__meta">
            <span
              class="stats-section__trend"
              :class="`is-${weekTrend.direction}`"
            >
              {{
                weekTrend.direction === 'positive'
                  ? '+'
                  : weekTrend.direction === 'negative'
                    ? '-'
                    : ''
              }}
              {{ weekTrend.delta.toFixed(1) }}% {{ weekTrend.label }}
            </span>
          </div>
        </div>

        <div class="stats-bars">
          <div
            v-for="day in weekDays"
            :key="day.key"
            class="stats-bar"
            :title="`${day.label} • ${formatMinutesShort(day.minutes)}`"
          >
            <div class="stats-bar__track">
              <div
                class="stats-bar__fill"
                :class="{ 'is-today': day.isToday, 'has-time': day.minutes > 0 }"
                :style="{ height: `${(day.minutes / currentWeekPeak) * 100}%` }"
              ></div>
            </div>
            <span :class="['stats-bar__label', { 'is-today': day.isToday }]">
              {{ day.label }}
            </span>
          </div>
        </div>
      </section>

      <section class="stats-card stats-card--skills">
        <div class="stats-card__eyebrow">SKILL HOURS</div>
        <div class="stats-card__hero stats-card__hero--compact">
          {{ formatMinutesDetailed(snapshot.user.focused_time) }}
        </div>
        <div class="stats-card__subline">hours total</div>

        <div class="stats-ranking">
          <div
            v-for="tag in sortedTags"
            :key="tag.id"
            class="stats-ranking__item"
          >
            <span
              class="stats-ranking__name"
              :style="{ color: RANK_COLORS[getTagRank(tag)] }"
            >
              {{ tag.title }}
            </span>
            <span class="stats-ranking__value">{{ formatMinutesShort(tag.time_spent) }}</span>
          </div>
        </div>
      </section>

      <section class="stats-card stats-card--heatmap">
        <div class="stats-heatmap__header">
          <div>
            <div class="stats-heatmap__headline">
              {{ formatNumber(activeDaysInSelectedYear) }}
              <span>ACTIVE DAYS IN {{ selectedYearEntry.year }}</span>
            </div>

            <div class="stats-heatmap__yearpicker">
              <label for="statsYear">YEAR</label>
              <select
                id="statsYear"
                v-model.number="selectedYear"
              >
                <option
                  v-for="year in availableYears"
                  :key="year.year"
                  :value="year.year"
                >
                  {{ year.year }}
                </option>
              </select>
            </div>
          </div>

          <div class="stats-heatmap__legend">
            <span>LESS</span>
            <div class="stats-heatmap__legend-scale">
              <span
                v-for="legend in heatmapLegend"
                :key="legend.key"
                class="stats-heatmap__legend-box"
                :style="{
                  backgroundColor: legend.opacity
                    ? `rgba(${ACCENT_RGB}, ${legend.opacity})`
                    : 'rgba(255, 255, 255, 0.04)',
                }"
              ></span>
            </div>
            <span>MORE</span>
          </div>
        </div>

        <div class="stats-heatmap">
          <div class="stats-heatmap__weekdays">
            <span
              v-for="day in WEEKDAY_LABELS"
              :key="day"
            >
              {{ day }}
            </span>
          </div>

          <div class="stats-heatmap__content">
            <div
              class="stats-heatmap__months"
              :style="{ gridTemplateColumns: `repeat(${heatmapColumns}, 12px)` }"
            >
              <span
                v-for="month in heatmapMonthLabels"
                :key="month.label"
                :style="{ gridColumn: `${month.column} / span 4` }"
              >
                {{ month.label }}
              </span>
            </div>

            <div
              class="stats-heatmap__grid"
              :style="{ gridTemplateRows: 'repeat(7, 12px)' }"
            >
              <div
                v-for="cell in heatmapCells"
                :key="cell.id"
                class="stats-heatmap__cell"
                :class="{ 'is-empty': cell.empty, 'is-today': cell.isToday }"
                :style="cell.empty ? null : { backgroundColor: cell.backgroundColor }"
                :title="formatHeatmapTooltip(cell)"
              ></div>
            </div>
          </div>
        </div>
      </section>

      <section class="stats-card stats-card--projects">
        <div class="stats-card__eyebrow">PROJECT OVERVIEW</div>
        <div class="stats-card__hero stats-card__hero--compact">
          {{ formatNumber(totalProjects) }}
        </div>
        <div class="stats-card__subline">projects total</div>

        <div class="stats-ranking">
          <div
            v-for="project in rankedProjects"
            :key="project.id"
            class="stats-ranking__item"
          >
            <span
              class="stats-ranking__name"
              :style="{ color: RANK_COLORS[getProjectRank(project)] }"
            >
              {{ project.name }}
            </span>
            <span class="stats-ranking__value">{{ formatMinutesShort(project.time_spent) }}</span>
          </div>
        </div>
      </section>

      <section class="stats-card stats-card--project-status">
        <div class="stats-project-status__block">
          <div class="stats-card__hero stats-card__hero--compact">
            {{ formatNumber(completedProjects) }}
          </div>
          <div class="stats-card__subline">projects done</div>
          <div class="stats-statusbar">
            <div
              class="stats-statusbar__fill stats-statusbar__fill--done"
              :style="{ width: `${completedProjectShare}%` }"
            ></div>
          </div>
        </div>

        <div class="stats-project-status__block">
          <div class="stats-card__hero stats-card__hero--compact">
            {{ formatNumber(cancelledProjects) }}
          </div>
          <div class="stats-card__subline">projects cancelled</div>
          <div class="stats-statusbar">
            <div
              class="stats-statusbar__fill stats-statusbar__fill--cancelled"
              :style="{ width: `${cancelledProjectShare}%` }"
            ></div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../styles/variables.scss' as *;

.stats-view {
  width: 610px;
  padding-right: 10px;
  padding-bottom: 30px;
}

.stats-toolbar {
  margin-top: 40px;
}

.stats-action {
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

    .stats-action__icon {
      fill: $main-background-color;
      opacity: 1;
      scale: 0.8;
    }
  }
}

.stats-action__icon {
  width: fit-content;
  height: fit-content;
  fill: $accent-color;
  opacity: 0.85;
  transform: rotate(180deg);
  transition: fill 0.3s ease;

  scale: 0.75;
  rotate: 180deg;
}

.stats-grid {
  display: grid;
  grid-template-columns: 450px 350px;
  gap: 10px;
  margin-top: 20px;
}

.stats-card {
  background-color: $card-background-color;
  border-radius: 8px;
  padding: 14px 14px 12px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.015);
  transition: box-shadow 0.25s ease;

  &:hover {
    box-shadow:
      inset 0 0 0 1px rgba($accent-color, 0.14),
      0 0 0 1px rgba($accent-color, 0.05);
  }
}

.stats-card--user,
.stats-card--overview {
  min-height: 118px;
}

.stats-card--focus,
.stats-card--skills {
  min-height: 270px;
}

.stats-card--heatmap {
  grid-column: 1 / -1;
  min-height: 212px;
}

.stats-card--projects,
.stats-card--project-status {
  min-height: 212px;
}

.stats-card__header,
.stats-section__top,
.stats-heatmap__header {
  display: flex;
  justify-content: space-between;
  gap: 1px;
}

.stats-user__name,
.stats-card__hero {
  font-family: 'Anek Devanagari', sans-serif;
  color: $common-color;
  line-height: 1;
}

.stats-user__name {
  font-size: 30px;
  font-weight: 600;
}

.stats-user__level,
.stats-card__eyebrow,
.stats-overview__label,
.stats-card__subline,
.stats-user__meta,
.stats-section__week,
.stats-heatmap__legend,
.stats-heatmap__yearpicker label,
.stats-heatmap__months,
.stats-heatmap__weekdays,
.stats-bar__label {
  font-family: 'Inter', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.stats-user__level,
.stats-card__subline,
.stats-overview__label,
.stats-card__eyebrow,
.stats-user__meta,
.stats-heatmap__legend,
.stats-heatmap__yearpicker label,
.stats-heatmap__months,
.stats-heatmap__weekdays,
.stats-bar__label {
  color: $secondary-text-color;
}

.stats-user__level {
  margin-top: -2px;
  font-size: 18px;
  font-weight: 600;
  color: $accent-color;
}

.stats-user__meta {
  font-size: 12px;
  font-weight: 600;
  padding-top: 10px;
}

.stats-user__progress {
  margin-top: 50px;
}

.stats-user__numbers {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
}

.stats-user__xp-current {
  color: $accent-color;
  font-size: 22px;
}

.stats-user__xp-needed {
  color: $secondary-text-color;
  font-size: 20px;
}

.stats-progress {
  width: 100%;
  height: 5px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  overflow: hidden;
}

.stats-progress__fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, rgba($accent-color, 0.92), rgba($accent-color, 0.72));
}

.stats-overview__item {
  padding: 8px 10px 10px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.03);

  & + & {
    margin-top: 10px;
  }
}

.stats-overview__label {
  font-size: 12px;
  font-weight: 700;
}

.stats-overview__value {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 9px;
  font-family: 'Anek Devanagari', sans-serif;
  font-size: 28px;
  font-weight: 600;
  color: $accent-color;
  line-height: 1;
}

.stats-overview__icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.stats-overview__xp-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background: rgba($accent-color, 0.1);
  color: $accent-color;
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  font-weight: 800;
}

.stats-card__eyebrow {
  font-size: 12px;
  font-weight: 700;
}

.stats-card__hero {
  margin-top: 6px;
  font-size: 42px;
  font-weight: 600;
}

.stats-card__hero--compact {
  font-size: 36px;
}

.stats-card__subline {
  margin-top: 2px;
  font-size: 12px;
  font-weight: 700;
}

.stats-section__meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}

.stats-section__week {
  color: $accent-color;
  font-size: 13px;
  font-weight: 700;
}

.stats-section__trend {
  max-width: 150px;
  text-align: right;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;

  &.is-positive {
    color: $pos-button-color;
  }

  &.is-negative {
    color: #cf7a68;
  }

  &.is-neutral {
    color: $secondary-text-color;
  }
}

.stats-bars {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 16px;
  align-items: end;
  height: 150px;
  margin-top: 14px;
}

.stats-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  height: 100%;
}

.stats-bar__track {
  display: flex;
  align-items: flex-end;
  height: 120px;
  width: 100%;
}

.stats-bar__fill {
  width: 100%;
  border-radius: 2px 2px 0 0;
  background: rgba(255, 255, 255, 0.36);
  transition: height 0.25s ease;

  &.has-time {
    min-height: 4px;
  }

  &.is-today {
    background: rgba($accent-color, 0.95);
    box-shadow: 0 0 14px rgba($accent-color, 0.15);
  }
}

.stats-bar__label {
  font-size: 12px;
  font-weight: 700;

  &.is-today {
    color: $accent-color;
  }
}

.stats-ranking {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 14px;
  max-height: 152px;
  padding-right: 4px;
  overflow-y: auto;
}

.stats-ranking__item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  min-height: 30px;
  padding: 0 10px;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.03);
}

.stats-ranking__name,
.stats-ranking__value {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
}

.stats-ranking__name {
  font-weight: 600;
}

.stats-ranking__value {
  color: $common-color;
  opacity: 0.85;
}

.stats-heatmap__headline {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-family: 'Anek Devanagari', sans-serif;
  color: $common-color;
  font-size: 40px;
  font-weight: 600;
  line-height: 1;

  span {
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 700;
    color: $secondary-text-color;
  }
}

.stats-heatmap__yearpicker {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;

  label {
    font-size: 12px;
    font-weight: 700;
  }

  select {
    border: none;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.04);
    color: $accent-color;
    padding: 4px 10px;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    font-weight: 700;
    outline: none;
    cursor: pointer;
  }
}

.stats-heatmap__legend {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 700;
}

.stats-heatmap__legend-scale {
  display: flex;
  gap: 4px;
}

.stats-heatmap__legend-box,
.stats-heatmap__cell {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.stats-heatmap {
  display: grid;
  grid-template-columns: 42px 1fr;
  gap: 10px;
  margin-top: 14px;
}

.stats-heatmap__weekdays {
  display: grid;
  grid-template-rows: repeat(7, 12px);
  gap: 4px;
  font-size: 10px;
  font-weight: 700;
  align-items: center;
  margin-top: 21px;
}

.stats-heatmap__content {
  min-width: 0;
}

.stats-heatmap__months {
  display: grid;
  gap: 2px;
  margin-bottom: 8px;
  font-size: 11px;
  font-weight: 700;
}

.stats-heatmap__grid {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 11px;
  gap: 3px;
  margin-left: -10px;
}

.stats-heatmap__cell {
  background: rgba(255, 255, 255, 0.04);

  &.is-today {
    outline: 1px solid rgba($accent-color, 0.95);
    outline-offset: 1px;
  }

  &.is-empty {
    opacity: 0;
    pointer-events: none;
  }
}

.stats-project-status__block {
  & + & {
    margin-top: 24px;
  }
}

.stats-statusbar {
  width: 100%;
  height: 16px;
  margin-top: 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  overflow: hidden;
}

.stats-statusbar__fill {
  height: 100%;
  border-radius: inherit;

  &--done {
    background: rgba($pos-button-color, 0.9);
  }

  &--cancelled {
    background: rgba($neg-button-color, 0.9);
  }
}

@media (max-width: 768px) {
  .stats-view {
    width: 100%;
    padding-right: 0;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stats-card--heatmap {
    grid-column: 1;
  }
}

@page {
  size: A4 landscape;
  margin: 8mm;
}

@media print {
  :global(body.stats-exporting) {
    width: auto !important;
    background: $main-background-color !important;
    overflow: visible !important;
  }

  :global(body.stats-exporting .dragBar),
  :global(body.stats-exporting .navWrapper),
  :global(body.stats-exporting .balanceWrapper),
  :global(body.stats-exporting .expBarWrapper),
  :global(body.stats-exporting .toast-container) {
    display: none !important;
  }

  :global(body.stats-exporting main) {
    position: static !important;
    left: 0 !important;
    margin: 0 !important;
  }

  .stats-toolbar {
    display: none !important;
  }

  .stats-view {
    width: 100% !important;
    padding: 0 !important;
  }

  .stats-grid {
    width: 100% !important;
    grid-template-columns: 1.45fr 1fr !important;
  }

  .stats-card {
    break-inside: avoid;
    page-break-inside: avoid;
  }
}
</style>
