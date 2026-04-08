<script setup>
// ========== IMPORTS ==========
// Icons
import PlusIcon from '../assets/plus.svg'
import DeleteIcon from '../assets/delete.svg'
// Components
import ModuleTitle from '../components/ModuleTitle.vue'
// Composables
import { useKeydowns } from '../helpers/composables/useKeydowns'
import { useToasts } from '../helpers/composables/useToasts'
// Stores
import { useTagsStore } from '../stores/tags'
import { useQuestsStore } from '../stores/quests'
import { storeToRefs } from 'pinia'
// Vue
import { computed, onMounted, onUnmounted, ref, toRaw, watch } from 'vue'
// Shared
import { useProgressions } from '../../../shared/utils/useProgressions'
import { useRanks } from '../../../shared/utils/useRanks'

// ========== DATA ==========
const questsStore = useQuestsStore()
const tagsStore = useTagsStore()

const { questlines, quests, tasks } = storeToRefs(questsStore)
const { tags } = storeToRefs(tagsStore)

const { addToast } = useToasts()
const { getQuestlineProgressionReward, getQuestProgressionReward } = useProgressions()
const { getQuestlineRank } = useRanks()

const selectedQuestlineId = ref(null)
const selectedQuestId = ref(null)
const isQuestlineDropdownOpen = ref(false)
const draggedQuestId = ref(null)
const draggedTaskId = ref(null)

const editingQuestlineTitle = ref(false)
const questlineTitleDraft = ref('')

const editingQuestId = ref(null)
const questTitleDraft = ref('')
const editingTaskId = ref(null)
const taskTitleDraft = ref('')

// ========== COMPUTED ==========
const sortedQuestlines = computed(() =>
  [...questlines.value].sort((a, b) => a.position - b.position),
)

const currentQuestline = computed(
  () =>
    sortedQuestlines.value.find((questline) => questline.id === selectedQuestlineId.value) ??
    sortedQuestlines.value[0] ??
    null,
)

const questsInCurrentQuestline = computed(() =>
  quests.value
    .filter((quest) => quest.questline_id === currentQuestline.value?.id)
    .sort((a, b) => a.position - b.position),
)

const currentQuest = computed(
  () =>
    questsInCurrentQuestline.value.find((quest) => quest.id === selectedQuestId.value) ??
    questsInCurrentQuestline.value[0] ??
    null,
)

const tasksInCurrentQuest = computed(() =>
  tasks.value
    .filter((task) => task.quest_id === currentQuest.value?.id)
    .sort((a, b) => a.position - b.position),
)

const currentQuestlineReward = computed(() =>
  currentQuestline.value ? getQuestlineProgressionReward(currentQuestline.value) : null,
)

const currentQuestReward = computed(() =>
  currentQuest.value
    ? getQuestProgressionReward(currentQuest.value, tasksInCurrentQuest.value)
    : null,
)

const questlineRankClass = computed(() =>
  currentQuestline.value ? `rank-${getQuestlineRank(currentQuestline.value)}` : 'rank-common',
)

const claimDisabled = computed(
  () => !currentQuestline.value || questsInCurrentQuestline.value.length > 0,
)

const epicClaimDisabled = computed(
  () =>
    !currentQuest.value ||
    tasksInCurrentQuest.value.length === 0 ||
    !tasksInCurrentQuest.value.every((task) => task.completed),
)

// ========== LIFECYCLE ==========
onMounted(async () => {
  await questsStore.init()
  await tagsStore.init()
})

onUnmounted(() => {
  questsStore.cleanupListeners()
  tagsStore.cleanupListeners()
})

watch(
  sortedQuestlines,
  (nextQuestlines) => {
    if (nextQuestlines.length === 0) {
      selectedQuestlineId.value = null
      return
    }

    const currentStillExists = nextQuestlines.some(
      (questline) => questline.id === selectedQuestlineId.value,
    )

    if (!currentStillExists) {
      selectedQuestlineId.value =
        nextQuestlines.find((questline) => questline.active)?.id ?? nextQuestlines[0].id
    }
  },
  { immediate: true },
)

watch(
  questsInCurrentQuestline,
  (nextQuests) => {
    if (nextQuests.length === 0) {
      selectedQuestId.value = null
      return
    }

    const currentStillExists = nextQuests.some((quest) => quest.id === selectedQuestId.value)
    if (!currentStillExists) {
      selectedQuestId.value = nextQuests.find((quest) => quest.active)?.id ?? nextQuests[0].id
    }
  },
  { immediate: true },
)

// ========== HELPERS ==========
const formatMinutes = (minutes) => {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours}h ${remainingMinutes}m`
}

const getRankClass = (questline) => `rank-${getQuestlineRank(questline)}`

const clearTransientUi = () => {
  isQuestlineDropdownOpen.value = false
}

const moveItemToPosition = async (draggedItem, targetItem, itemType) => {
  const fromPosition = draggedItem.position
  const toPosition = targetItem.position

  if (fromPosition === toPosition) return

  const direction = fromPosition < toPosition ? 'down' : 'up'
  const steps = Math.abs(toPosition - fromPosition)
  const movingItem = { ...draggedItem }

  for (let step = 0; step < steps; step++) {
    const result = await window.api.moveItem(movingItem, itemType, direction)
    if (!result.success) {
      addToast({ message: result.message, type: 'error' })
      return
    }

    movingItem.position = direction === 'down' ? movingItem.position + 1 : movingItem.position - 1
  }
}

// ========== QUESTLINE ==========
const selectQuestline = async (questline) => {
  selectedQuestlineId.value = questline.id
  isQuestlineDropdownOpen.value = false
  editingQuestlineTitle.value = false

  if (!questline.active) {
    await questsStore.activateQuestline(toRaw(questline))
  }
}

const toggleQuestlineDropdown = () => {
  if (!currentQuestline.value && sortedQuestlines.value.length === 0) return
  isQuestlineDropdownOpen.value = !isQuestlineDropdownOpen.value
}

const addDefaultQuestline = async () => {
  const result = await questsStore.addQuestline({
    title: 'New Project',
    description: 'Project description',
  })

  addToast({ message: result.message, type: result.success ? 'success' : 'error' })

  if (!result.success) return

  await questsStore.fetchQuestlines()
  const latestQuestline = [...questlines.value].sort((a, b) => a.position - b.position).at(-1)
  if (latestQuestline) {
    await selectQuestline(latestQuestline)
  }
}

const startQuestlineTitleEdit = () => {
  if (!currentQuestline.value) return
  questlineTitleDraft.value = currentQuestline.value.title
  editingQuestlineTitle.value = true
  isQuestlineDropdownOpen.value = false
}

const saveQuestlineTitle = async () => {
  if (!editingQuestlineTitle.value || !currentQuestline.value) return

  const result = await questsStore.editQuestline({
    ...toRaw(currentQuestline.value),
    title: questlineTitleDraft.value,
  })

  addToast({ message: result.message, type: result.success ? 'success' : 'error' })

  if (result.success) {
    editingQuestlineTitle.value = false
  }
}

const cancelQuestlineTitle = () => {
  editingQuestlineTitle.value = false
}

// ========== QUESTS ==========
const selectQuest = async (quest) => {
  selectedQuestId.value = quest.id
  if (!quest.active) {
    await questsStore.activateQuest(toRaw(quest))
  }
}

const startQuestTitleEdit = (quest) => {
  editingQuestId.value = quest.id
  questTitleDraft.value = quest.title
}

const saveQuestTitle = async () => {
  if (editingQuestId.value === null) return

  const questToUpdate = quests.value.find((quest) => quest.id === editingQuestId.value)
  if (!questToUpdate) return

  const result = await questsStore.editQuest({
    ...toRaw(questToUpdate),
    title: questTitleDraft.value,
  })

  addToast({ message: result.message, type: result.success ? 'success' : 'error' })

  if (result.success) {
    editingQuestId.value = null
  }
}

const cancelQuestTitle = () => {
  editingQuestId.value = null
}

const onQuestDragStart = (quest) => {
  if (editingQuestId.value !== null || editingTaskId.value !== null) return
  draggedQuestId.value = quest.id
  selectedQuestId.value = quest.id
}

const onQuestDragEnd = () => {
  draggedQuestId.value = null
}

const onQuestDrop = async (targetQuest) => {
  if (draggedQuestId.value === null || draggedQuestId.value === targetQuest.id) {
    draggedQuestId.value = null
    return
  }

  const draggedQuest = questsInCurrentQuestline.value.find(
    (quest) => quest.id === draggedQuestId.value,
  )
  if (!draggedQuest) {
    draggedQuestId.value = null
    return
  }

  await moveItemToPosition(draggedQuest, targetQuest, 'quests')
  draggedQuestId.value = null
}

const onQuestDeleteDrop = async () => {
  if (draggedQuestId.value === null) return

  const result = await questsStore.deleteQuest(draggedQuestId.value)
  addToast({ message: result.message, type: result.success ? 'warning' : 'error' })

  if (result.success && selectedQuestId.value === draggedQuestId.value) {
    selectedQuestId.value = null
    editingQuestId.value = null
  }

  draggedQuestId.value = null
}

const addDefaultQuest = async () => {
  if (!currentQuestline.value || tags.value.length === 0) return

  const result = await questsStore.addQuest({
    title: 'New Quest',
    questline_id: currentQuestline.value.id,
    tag_id_1: tags.value[0].id,
    tag_id_2: null,
  })

  addToast({ message: result.message, type: result.success ? 'success' : 'error' })
}

const updatePrimaryTag = async (value) => {
  if (!currentQuest.value) return

  const result = await questsStore.editQuest({
    ...toRaw(currentQuest.value),
    tag_id_1: Number(value),
  })

  addToast({ message: result.message, type: result.success ? 'success' : 'error' })
}

const updateSecondaryTag = async (value) => {
  if (!currentQuest.value) return

  const result = await questsStore.editQuest({
    ...toRaw(currentQuest.value),
    tag_id_2: value === 'NONE' ? null : Number(value),
  })

  addToast({ message: result.message, type: result.success ? 'success' : 'error' })
}

// ========== TASKS ==========
const startTaskTitleEdit = (task) => {
  editingTaskId.value = task.id
  taskTitleDraft.value = task.title
}

const saveTaskTitle = async () => {
  if (editingTaskId.value === null) return

  const taskToUpdate = tasks.value.find((task) => task.id === editingTaskId.value)
  if (!taskToUpdate) return

  const result = await questsStore.editTask({
    ...toRaw(taskToUpdate),
    title: taskTitleDraft.value,
  })

  addToast({ message: result.message, type: result.success ? 'success' : 'error' })

  if (result.success) {
    editingTaskId.value = null
  }
}

const cancelTaskTitle = () => {
  editingTaskId.value = null
}

const addDefaultTask = async () => {
  if (!currentQuest.value) return

  const result = await questsStore.addTask({
    title: 'New Task',
    quest_id: currentQuest.value.id,
  })

  addToast({ message: result.message, type: result.success ? 'success' : 'error' })
}

const toggleTaskCompletion = async (task) => {
  await questsStore.toggleTaskCompletion(toRaw(task))
}

const deleteTask = async (taskId) => {
  const result = await questsStore.deleteTask(taskId)
  addToast({ message: result.message, type: result.success ? 'warning' : 'error' })
}

const onTaskDragStart = (task) => {
  if (editingTaskId.value !== null || editingQuestId.value !== null) return
  draggedTaskId.value = task.id
}

const onTaskDragEnd = () => {
  draggedTaskId.value = null
}

const onTaskDrop = async (targetTask) => {
  if (draggedTaskId.value === null || draggedTaskId.value === targetTask.id) {
    draggedTaskId.value = null
    return
  }

  const draggedTask = tasksInCurrentQuest.value.find((task) => task.id === draggedTaskId.value)
  if (!draggedTask) {
    draggedTaskId.value = null
    return
  }

  await moveItemToPosition(draggedTask, targetTask, 'tasks')
  draggedTaskId.value = null
}

// ========== REWARD ACTIONS ==========
const claimQuestlineReward = async () => {
  if (!currentQuestline.value) return
  await questsStore.claimQuestlineReward(toRaw(currentQuestline.value))
}

const cancelQuestline = async () => {
  if (!currentQuestline.value) return
  await questsStore.cancelQuestline(toRaw(currentQuestline.value))
}

const claimCurrentEpic = async () => {
  if (!currentQuest.value) return
  await questsStore.claimQuestReward(toRaw(currentQuest.value))
}

// ========== KEYDOWNS ==========
useKeydowns({
  onSave: () => {
    if (editingQuestlineTitle.value) {
      saveQuestlineTitle()
      return
    }

    if (editingQuestId.value !== null) {
      saveQuestTitle()
      return
    }

    if (editingTaskId.value !== null) {
      saveTaskTitle()
    }
  },
  onCancel: () => {
    if (editingQuestlineTitle.value) {
      cancelQuestlineTitle()
      return
    }

    if (editingQuestId.value !== null) {
      cancelQuestTitle()
      return
    }

    if (editingTaskId.value !== null) {
      cancelTaskTitle()
    }
  },
})
</script>

<template>
  <div
    class="projectsView"
    @click="clearTransientUi"
  >
    <div
      class="questlineSelector"
      @dblclick.stop="startQuestlineTitleEdit"
    >
      <template v-if="editingQuestlineTitle">
        <input
          v-model="questlineTitleDraft"
          class="questlineTitleInput"
          type="text"
          spellcheck="false"
          @click.stop
        />
      </template>
      <template v-else>
        <p>{{ currentQuestline?.title ?? 'Select Project' }}</p>
      </template>

      <div
        class="selectorIconButton"
        @click.stop="toggleQuestlineDropdown"
      >
        <PlusIcon
          class="addIcon"
          :class="{ rotated: isQuestlineDropdownOpen }"
        />
      </div>

      <div
        v-if="isQuestlineDropdownOpen"
        class="questlineDropdown"
        @click.stop
      >
        <button
          v-for="questline in sortedQuestlines"
          :key="questline.id"
          class="questlineOption"
          :class="{ active: currentQuestline?.id === questline.id }"
          @click="selectQuestline(questline)"
        >
          <span>{{ questline.title }}</span>
          <span :class="['questlineOptionRank', getRankClass(questline)]">
            {{ getQuestlineRank(questline) }}
          </span>
        </button>

        <button
          class="questlineOption createQuestlineOption"
          @click="addDefaultQuestline"
        >
          <span>Create New Project</span>
          <span class="questlineOptionRank">new</span>
        </button>
      </div>
    </div>

    <div class="projectsGrid">
      <section class="projectColumn">
        <div class="columnHeader">
          <h3>Epics</h3>
        </div>

        <div class="panel questListPanel">
          <button
            v-for="quest in questsInCurrentQuestline"
            :key="quest.id"
            class="questRow"
            :class="{
              selected: currentQuest?.id === quest.id,
              dragging: draggedQuestId === quest.id,
            }"
            :draggable="editingQuestId !== quest.id"
            @click.stop="selectQuest(quest)"
            @dblclick.stop="startQuestTitleEdit(quest)"
            @dragstart="onQuestDragStart(quest)"
            @dragend="onQuestDragEnd"
            @dragover.prevent
            @drop="onQuestDrop(quest)"
          >
            <template v-if="editingQuestId === quest.id">
              <input
                v-model="questTitleDraft"
                class="questTitleInput"
                type="text"
                spellcheck="false"
                @click.stop
              />
            </template>
            <template v-else>
              <span class="questTitle">{{ quest.title }}</span>
            </template>

            <span class="questMeta">
              {{
                [
                  tags.find((tag) => tag.id === quest.tag_id_1)?.title,
                  tags.find((tag) => tag.id === quest.tag_id_2)?.title,
                ]
                  .filter(Boolean)
                  .join(' / ') || 'No Skill'
              }}
            </span>
          </button>

          <button
            class="addNewButton"
            @click="addDefaultQuest"
          >
            Add New
          </button>

          <div
            v-if="currentQuest"
            class="epicRewardPreview"
          >
            <div class="rewardRow compact">
              <span>Crystals</span>
              <strong>{{ currentQuestReward?.crystals ?? 0 }}</strong>
            </div>
            <div class="rewardRow compact">
              <span>User EXP</span>
              <strong>{{ currentQuestReward?.userExp ?? 0 }}</strong>
            </div>
            <div class="rewardRow compact">
              <span>Tag EXP</span>
              <strong>{{ currentQuestReward?.tagExp ?? 0 }}</strong>
            </div>
            <button
              class="actionButton primary compactButton"
              :disabled="epicClaimDisabled"
              @click="claimCurrentEpic"
            >
              Claim Epic
            </button>
          </div>
        </div>
      </section>

      <section class="projectColumn">
        <div class="columnHeader">
          <h3>Tasks</h3>
        </div>

        <div class="panel taskPanel">
          <template v-if="currentQuest">
            <div class="tagAssignment">
              <div class="tagSelectGroup">
                <label>Primary Skill</label>
                <select
                  :value="currentQuest.tag_id_1"
                  @change="updatePrimaryTag($event.target.value)"
                >
                  <option
                    v-for="tag in tags"
                    :key="tag.id"
                    :value="tag.id"
                  >
                    {{ tag.title }}
                  </option>
                </select>
              </div>

              <div class="tagSelectGroup">
                <label>Secondary Skill</label>
                <select
                  :value="currentQuest.tag_id_2 ?? 'NONE'"
                  @change="updateSecondaryTag($event.target.value)"
                >
                  <option value="NONE">NONE</option>
                  <option
                    v-for="tag in tags"
                    :key="tag.id"
                    :value="tag.id"
                  >
                    {{ tag.title }}
                  </option>
                </select>
              </div>
            </div>

            <div class="taskList">
              <div
                v-for="task in tasksInCurrentQuest"
                :key="task.id"
                class="taskRow"
                :class="{
                  completed: task.completed,
                  dragging: draggedTaskId === task.id,
                }"
                :draggable="editingTaskId !== task.id"
                @dragstart="onTaskDragStart(task)"
                @dragend="onTaskDragEnd"
                @dragover.prevent
                @drop="onTaskDrop(task)"
              >
                <label class="taskCheckbox">
                  <input
                    type="checkbox"
                    :checked="task.completed"
                    @change="toggleTaskCompletion(task)"
                  />
                  <span class="checkmark"></span>
                </label>

                <template v-if="editingTaskId === task.id">
                  <input
                    v-model="taskTitleDraft"
                    class="taskTitleInput"
                    type="text"
                    spellcheck="false"
                    @click.stop
                  />
                </template>
                <template v-else>
                  <span
                    class="taskTitle"
                    @dblclick.stop="startTaskTitleEdit(task)"
                  >
                    {{ task.title }}
                  </span>
                </template>

                <button
                  class="taskDeleteButton"
                  @click.stop="deleteTask(task.id)"
                >
                  <DeleteIcon class="taskDeleteIcon" />
                </button>
              </div>
            </div>

            <button
              class="addNewButton"
              @click="addDefaultTask"
            >
              Add Task
            </button>
          </template>

          <div
            v-else
            class="emptyState"
          >
            <p>Select or add a quest first.</p>
          </div>
        </div>
      </section>

      <section class="projectColumn">
        <div class="summaryStack">
          <div class="columnHeader">
            <h3>Overview</h3>
          </div>

          <div class="panel summaryPanel">
            <p class="summaryLabel">Project Time</p>
            <h3>{{ currentQuestline ? formatMinutes(currentQuestline.time_spent) : '0h 0m' }}</h3>
            <p
              class="summaryRank"
              :class="questlineRankClass"
            >
              {{ currentQuestline ? getQuestlineRank(currentQuestline) : 'common' }}
            </p>
          </div>

          <div class="panel rewardPanel">
            <p class="summaryLabel">Questline Reward</p>

            <div class="rewardRow">
              <span>Crystals</span>
              <strong>{{ currentQuestlineReward?.crystals ?? 0 }}</strong>
            </div>

            <div class="rewardRow">
              <span>Experience</span>
              <strong>{{ currentQuestlineReward?.userExp ?? 0 }}</strong>
            </div>

            <p class="cancelHint">Canceling grants half of the displayed reward.</p>

            <div class="rewardActions">
              <button
                class="actionButton primary"
                :disabled="claimDisabled"
                @click="claimQuestlineReward"
              >
                Complete & Claim
              </button>
              <button
                class="actionButton secondary"
                :disabled="!currentQuestline"
                @click="cancelQuestline"
              >
                Cancel Project
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>

    <div
      v-if="draggedQuestId !== null"
      class="deleteDropzone"
      @click.stop
      @dragover.prevent
      @drop.prevent="onQuestDeleteDrop"
    >
      <DeleteIcon class="deleteDropzoneIcon" />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../styles/variables.scss' as *;
@use '../styles/base_card.css' as *;

.projectsView {
  position: relative;
  margin-top: 40px;
}

.questlineSelector {
  position: relative;
  width: 250px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  border-radius: 2px;
  background-color: $card-background-color;
  transition: all 0.2s ease;
  cursor: pointer;

  p {
    width: calc(100% - 36px);
    font-family: 'Inter', sans-serif;
    font-size: 16px;
    font-weight: 500;
    color: $accent-color;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.selectorIconButton {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.addIcon {
  scale: 0.75;
  fill: $accent-color;
  transition:
    transform 0.2s ease,
    fill 0.2s ease;

  &.rotated {
    transform: rotate(45deg);
  }
}

.questlineSelector:hover {
  background-color: rgba($accent-color, 0.14);
}

.questlineTitleInput {
  width: calc(100% - 36px);
  border: none;
  outline: none;
  padding: 4px 6px;
  border-radius: 2px;
  background-color: rgba(255, 255, 255, 0.05);
  color: $primary-text-color;
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  font-weight: 500;
}

.questlineDropdown {
  position: absolute;
  top: 46px;
  left: 0;
  width: 250px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 6px;
  border-radius: 2px;
  background-color: #171717;
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.35);
  z-index: 20;
}

.questlineOption {
  width: 100%;
  border: none;
  border-radius: 2px;
  background-color: transparent;
  color: $primary-text-color;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  text-align: left;
  cursor: pointer;

  &:hover,
  &.active {
    background-color: rgba($accent-color, 0.1);
  }
}

.createQuestlineOption {
  margin-top: 2px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding-top: 12px;
}

.questlineOptionRank {
  font-size: 11px;
  text-transform: uppercase;
}

.projectsGrid {
  margin-top: 24px;
  display: grid;
  grid-template-columns: repeat(3, 250px);
  gap: 12px;
}

.projectColumn {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.columnHeader {
  padding: 0 4px;

  h3 {
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: $secondary-text-color;
  }
}

.panel {
  min-height: 80px;
  padding: 12px;
  border-radius: 5px;
  background-color: $card-background-color;
}

.questListPanel,
.taskPanel {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.questRow {
  width: 100%;
  min-height: 54px;
  border: 1px solid transparent;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.03);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 4px;
  padding: 10px 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover,
  &.selected {
    border-color: rgba($accent-color, 0.35);
    background-color: rgba($accent-color, 0.08);
  }

  &.dragging {
    opacity: 0.5;
  }
}

.questTitle {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: $primary-text-color;
}

.questMeta {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: $secondary-text-color;
}

.questTitleInput {
  width: 100%;
  border: none;
  outline: none;
  padding: 0;
  background: transparent;
  color: $primary-text-color;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
}

.tagAssignment {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.tagSelectGroup {
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-family: 'Inter', sans-serif;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: $secondary-text-color;
  }

  select {
    width: 100%;
    border: none;
    outline: none;
    border-radius: 4px;
    background-color: rgba(255, 255, 255, 0.05);
    padding: 10px 12px;
    color: $primary-text-color;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
  }
}

.taskList {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.taskRow {
  display: grid;
  grid-template-columns: 22px 1fr 28px;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.03);
  padding: 0 10px;

  &.completed .taskTitle {
    color: $secondary-text-color;
    text-decoration: line-through;
  }

  &.dragging {
    opacity: 0.5;
  }
}

.taskCheckbox {
  position: relative;
  width: 16px;
  height: 16px;
  cursor: pointer;

  input {
    opacity: 0;
    position: absolute;
    inset: 0;
    cursor: pointer;
  }
}

.checkmark {
  position: absolute;
  inset: 0;
  border-radius: 3px;
  border: 1px solid rgba($accent-color, 0.45);
  background-color: transparent;
}

.taskCheckbox input:checked + .checkmark {
  background-color: $accent-color;
}

.taskTitle {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: $primary-text-color;
}

.taskTitleInput {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: $primary-text-color;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 500;
}

.taskDeleteButton {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  cursor: pointer;
  opacity: 0.55;
  transition:
    opacity 0.2s ease,
    background-color 0.2s ease;

  &:hover {
    opacity: 1;
    background-color: rgba(220, 80, 80, 0.1);
  }
}

.taskDeleteIcon {
  width: 14px;
  height: 14px;
  fill: #d85f5f;
}

.addNewButton {
  width: 100%;
  min-height: 42px;
  border: 1px dashed rgba($accent-color, 0.3);
  border-radius: 4px;
  background-color: transparent;
  color: $accent-color;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba($accent-color, 0.08);
  }
}

.epicRewardPreview {
  margin-top: 4px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.summaryStack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summaryPanel,
.rewardPanel {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.summaryLabel {
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: $secondary-text-color;
}

.summaryPanel h3 {
  font-family: 'Inter', sans-serif;
  font-size: 28px;
  font-weight: 700;
  color: $primary-text-color;
}

.summaryRank {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.rewardRow {
  display: flex;
  align-items: center;
  justify-content: space-between;

  span {
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    color: $secondary-text-color;
  }

  strong {
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 700;
    color: $accent-color;
  }
}

.rewardRow.compact {
  span,
  strong {
    font-size: 12px;
  }
}

.cancelHint {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  line-height: 1.5;
  color: $secondary-text-color;
}

.rewardActions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
}

.actionButton {
  min-height: 40px;
  border: none;
  border-radius: 4px;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.35;
  }

  &:not(:disabled):hover {
    transform: translateY(-1px);
  }

  &.primary {
    background-color: $accent-color;
    color: $main-background-color;
  }

  &.secondary {
    background-color: rgba(220, 80, 80, 0.14);
    color: #d85f5f;
  }
}

.compactButton {
  min-height: 36px;
  margin-top: 4px;
}

.emptyState {
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;

  p {
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    line-height: 1.5;
    color: $secondary-text-color;
  }
}

.rank-common {
  color: $common-color;
}

.rank-uncommon {
  color: $uncommon-color;
}

.rank-rare {
  color: $rare-color;
}

.rank-epic {
  color: $epic-color;
}

.rank-legendary {
  color: $legendary-color;
}

.rank-mythic {
  color: $mythic-color;
}

.deleteDropzone {
  position: fixed;
  right: 30px;
  bottom: 30px;
  width: 40px;
  height: 40px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(220, 80, 80, 0.12);
  border: 1px solid rgba(220, 80, 80, 0.35);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  z-index: 50;
  transition: all 0.2s ease-in-out;

  &:hover {
    transform: scale(1.1);
  }
}

.deleteDropzoneIcon {
  width: 20px;
  height: 20px;
  fill: #d85f5f;
}
</style>
