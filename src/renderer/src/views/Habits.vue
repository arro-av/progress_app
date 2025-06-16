<script setup>
// ========== IMPORTS ==========
// Icons
import PlusIcon from '../assets/plus.svg'
// Components
import ModuleTitle from '../components/ModuleTitle.vue'
import Card from '../components/Card.vue'
import EditItem from '../components/EditItem.vue'
import AddItem from '../components/AddItem.vue'
// Composables
import { useEdit } from '../helpers/composables/useEdit'
import { useAdd } from '../helpers/composables/useAdd'
import { useKeydowns } from '../helpers/composables/useKeydowns'
import { useEditEnable } from '../helpers/composables/useEditEnable'
// Stores
import { useTagsStore } from '../stores/tags'
import { useHabitsStore } from '../stores/habits'
import { storeToRefs } from 'pinia'
// Vue
import { onMounted, onUnmounted, toRaw } from 'vue'
// Helpers
import { moveItem } from '../helpers/moveItem'

// ========== DATA ==========
const habitsStore = useHabitsStore()
const { habits } = storeToRefs(habitsStore)
const { habitStacks } = storeToRefs(habitsStore)

const tagsStore = useTagsStore()
const { tags } = storeToRefs(tagsStore)

const { editEnabled, toggleEditEnabled } = useEditEnable()

// ========= LIFECYCLE =========
onMounted(async () => {
  habitsStore.init()
  tagsStore.init()
})

onUnmounted(async () => {
  habitsStore.cleanupListeners()
  tagsStore.cleanupListeners()
})

// ========== EDITOR CONFIGS ==========
// Habit Editor
const {
  editingId: habitEditingId,
  editedItemData: habitEditedItemData,
  startEditing: habitStartEditing,
  cancelEditing: habitCancelEditing,
  saveEditing: habitSaveEditing,
  deleteEditing: habitDeleteEditing,
} = useEdit({
  editFn: habitsStore.editHabit,
  deleteFn: habitsStore.deleteHabit,
})

// Habit Stack Editor
const {
  editingId: stackEditingId,
  editedItemData: stackEditedItemData,
  startEditing: stackStartEditing,
  cancelEditing: stackCancelEditing,
  saveEditing: stackSaveEditing,
  deleteEditing: stackDeleteEditing,
} = useEdit({
  editFn: habitsStore.editHabitStack,
  deleteFn: habitsStore.deleteHabitStack,
})

// ========= ADDER CONFIGS ==========
// Habit Adder
const {
  isAdding: habitIsAdding,
  addedItemData: habitAddedItemData,
  activeListId: habitActiveListId,
  startAdding: habitStartAdding,
  cancelAdding: habitCancelAdding,
  saveAdding: habitSaveAdding,
} = useAdd({
  addFn: habitsStore.addHabit,
  itemType: 'habits',
})

const {
  isAdding: habitStackIsAdding,
  addedItemData: habitStackAddedItemData,
  startAdding: habitStackStartAdding,
  cancelAdding: habitStackCancelAdding,
  saveAdding: habitStackSaveAdding,
} = useAdd({
  addFn: habitsStore.addHabitStack,
  itemType: 'habit_stacks',
})

// ========== KEYDOWNS ==========
useKeydowns({
  onEdit: () => {
    if (
      !habitEditingId.value &&
      !stackEditingId.value &&
      !habitIsAdding.value &&
      !habitStackIsAdding.value
    ) {
      toggleEditEnabled()
    }
  },
})
</script>

<template>
  <ModuleTitle title="Habits" />

  <div
    id="habitsWrapper"
    class="moduleWrapper"
  >
    <div
      v-for="habitStack in habitStacks"
      :key="habitStack.id"
      class="habitStackCard"
    >
      <div class="stackTitleWrapper">
        <template v-if="stackEditingId !== habitStack.id">
          <Card
            :itemData="habitStack"
            :itemType="'habit_stacks'"
            @click="editEnabled ? stackStartEditing(habitStack, 'habit_stacks') : null"
            @move-item="moveItem(toRaw(habitStack), 'habit_stacks', $event)"
          />
        </template>

        <template v-else>
          <EditItem
            :itemType="'stacks'"
            v-model="stackEditedItemData"
            @save-edit="stackSaveEditing"
            @cancel-edit="stackCancelEditing"
            @delete-edit="stackDeleteEditing"
          />
        </template>
      </div>

      <div
        v-for="habit in habits.filter((habit) => habit.stack_id === habitStack.id)"
        :key="habit.id"
        id="habitCard"
      >
        <template v-if="habitEditingId !== habit.id">
          <Card
            :itemData="habit"
            :itemType="'habits'"
            @click="editEnabled ? habitStartEditing(habit, 'habits') : null"
            @toggle-completion="habitsStore.toggleHabitCompletion(habit)"
            @move-item="moveItem(toRaw(habit), 'habits', $event)"
          />
        </template>
        <template v-else>
          <EditItem
            :itemType="'habits'"
            :allTags="tags"
            :allHabitStacks="habitStacks"
            v-model="habitEditedItemData"
            @save-edit="habitSaveEditing"
            @cancel-edit="habitCancelEditing"
            @delete-edit="habitDeleteEditing"
          />
        </template>
      </div>

      <!--Show AddIcon -->
      <template v-if="!habitIsAdding">
        <div
          v-if="
            editEnabled ||
            habitsStore.habits.filter((habit) => habit.stack_id === habitStack.id).length === 0
          "
          class="addHabitWrapper"
          @click="habitStartAdding(habitStack.id)"
        >
          <PlusIcon class="addIcon" />
        </div>
      </template>
      <!--Show AddItem if adding button is clicked-->
      <template v-else-if="habitIsAdding && habitStack.id == habitActiveListId">
        <AddItem
          :stackId="habitStack.id"
          :itemType="'habits'"
          :allTags="tags"
          v-model="habitAddedItemData"
          @save-add="habitSaveAdding()"
          @cancel-add="habitCancelAdding()"
        />
      </template>
    </div>

    <template v-if="!habitStackIsAdding">
      <div
        v-if="editEnabled || habitsStore.habitStacks.length === 0"
        class="addHabitStackWrapper"
        @click="habitStackStartAdding()"
      >
        <PlusIcon class="addIcon" />
      </div>
    </template>
    <template v-else-if="habitStackIsAdding">
      <AddItem
        :itemType="'stacks'"
        v-model="habitStackAddedItemData"
        @save-add="habitStackSaveAdding()"
        @cancel-add="habitStackCancelAdding()"
      />
    </template>
  </div>
</template>
