<script setup>
import { ref, computed, onUnmounted, onMounted, toRaw } from 'vue'
import ModuleTitle from '../components/ModuleTitle.vue'

import { useUniversals } from '../helpers/db_functions/useUniversals'
import { useSort } from '../helpers/composables/useSort'
import { useProjects } from '../helpers/db_functions/useProjects'
import { useTodoLists } from '../helpers/db_functions/useTodoLists'
import { useTodoItems } from '../helpers/db_functions/useTodoItems'
import { useUser } from '../helpers/db_functions/useUser'

const { getItems } = useUniversals()
const { sortByPosition } = useSort()
const { activateProject, onProjectsUpdate } = useProjects()
const { onTodoListsUpdate } = useTodoLists()
const { onTodoItemsUpdate, toggleTodoItemCompletion } = useTodoItems()
const { addTime } = useUser()

let cleanupProjectsUpdate = null
let cleanupTodoListsUpdate = null
let cleanupTodoItemsUpdate = null

const projects = ref([])
const todo_lists = ref([])
const todo_items = ref([])

const nextTodo = ref(null)

const isRunning = ref(false)
const timerDuration = ref(25) // in minutes
const timeLeft = ref(25 * 60) // in seconds
let timer = null

const formattedTime = computed(() => {
  const minutes = Math.floor(timeLeft.value / 60)
  const seconds = timeLeft.value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

const progress = computed(() => {
  return (timeLeft.value / (timerDuration.value * 60)) * 100
})

const startTimer = () => {
  if (timeLeft.value <= 0) {
    timeLeft.value = timerDuration.value * 60
  }
  isRunning.value = true

  timer = setInterval(() => {
    if (timeLeft.value <= 0) {
      clearInterval(timer)
      isRunning.value = false
      new Notification('Timer finished!')

      addTime(toRaw(timerDuration.value))
      return
    }
    timeLeft.value--
  }, 1000)
}

const resetTimer = () => {
  isRunning.value = false
  clearInterval(timer)
  timeLeft.value = timerDuration.value * 60
}

const updateTimerDuration = (minutes) => {
  timerDuration.value = parseInt(minutes)
  if (!isRunning.value) {
    timeLeft.value = timerDuration.value * 60
  }
}

onMounted(async () => {
  projects.value = await getItems('projects')
  todo_lists.value = sortByPosition(await getItems('todo_lists'))
  todo_items.value = sortByPosition(await getItems('todo_items'))

  cleanupProjectsUpdate = onProjectsUpdate(async () => {
    projects.value = await getItems('projects')
  })

  cleanupTodoListsUpdate = onTodoListsUpdate(async () => {
    todo_lists.value = sortByPosition(await getItems('todo_lists'))
  })

  cleanupTodoItemsUpdate = onTodoItemsUpdate(async () => {
    todo_items.value = sortByPosition(await getItems('todo_items'))
  })
})

onUnmounted(async () => {
  if (cleanupProjectsUpdate) {
    await cleanupProjectsUpdate()
  }

  if (cleanupTodoListsUpdate) {
    await cleanupTodoListsUpdate()
  }

  if (cleanupTodoItemsUpdate) {
    await cleanupTodoItemsUpdate()
  }

  clearInterval(timer)
})
</script>

<template>
  <ModuleTitle title="Pomodoro Timer" />

  <div class="projects-container">
    <div
      v-if="!isRunning"
      v-for="project in projects"
      :key="project.id"
      class="single-project"
    >
      <h4>{{ project.title }}</h4>
      <div
        :class="project.active ? 'checkbox activeCheckbox' : 'checkbox'"
        @click="activateProject(toRaw(project))"
      >
        ACTIVE
      </div>
    </div>
    <div
      v-else
      v-for="filteredProject in projects.filter((project) => project.active)"
      :key="filteredProject.id"
      class="single-project"
    >
      <h4>{{ filteredProject.title }}</h4>
    </div>
  </div>

  <div class="timer-container">
    <div class="timer-display">
      <div class="time">{{ formattedTime }}</div>
      <div class="progress-bar">
        <div
          class="progress"
          :style="{ width: `${progress}%` }"
        ></div>
      </div>
    </div>

    <div class="controls">
      <div
        v-if="!isRunning"
        class="slider-container"
      >
        <input
          type="range"
          v-model="timerDuration"
          @input="updateTimerDuration($event.target.value)"
          min="1"
          max="120"
          class="slider"
          :disabled="isRunning"
        />
      </div>

      <div class="buttons">
        <button
          v-if="!isRunning"
          @click="startTimer"
          class="btn start-btn"
        >
          Start
        </button>
        <button
          v-else
          @click="resetTimer"
          class="btn reset-btn"
        >
          Cancel
        </button>
      </div>
      <div v-for="project in projects.filter((project) => project.active)">
        <div
          v-for="todo_list in todo_lists.filter(
            (todo_list) => todo_list.project_id === project.id && todo_list.position === 0,
          )"
        >
          <div
            v-for="todo_item in todo_items
              .filter(
                (todo_item) =>
                  todo_item.todo_list_id === todo_list.id && todo_item.completed === false,
              )
              .sort((a, b) => a.position - b.position)
              .slice(0, 1)"
          >
            <div class="todo-item-timer">
              <p>{{ todo_item.title }}</p>
              <div
                class="checkbox"
                @click="toggleTodoItemCompletion(toRaw(todo_item))"
              >
                DONE
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
