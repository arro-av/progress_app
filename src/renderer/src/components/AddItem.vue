<script setup>
// ========== IMPORTS ==========
// Vue
import { computed, ref } from 'vue'
// Icons
import RepeatIcon from '../assets/repeat.svg'
// Composables
import { useKeydowns } from '../helpers/composables/useKeydowns'

// ========== DATA ==========
const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  itemType: {
    type: String,
    required: true,
    validator: (value) =>
      ['rewards', 'tags', 'ideas', 'habits', 'stacks', 'todo_lists', 'todo_items'].includes(value),
  },
  allTags: {
    type: Array,
    default: () => [],
  },
  allHabitStacks: {
    type: Array,
    default: () => [],
  },
  allTodoLists: {
    type: Array,
    default: () => [],
  },
  allProjects: {
    type: Array,
    default: () => [],
  },
  stackId: {
    type: Number,
    default: null,
  },
  listId: {
    type: Number,
    default: null,
  },
  projectId: {
    type: Number,
    default: null,
  },
})

// ========== COMPUTED ==========
// Syncs v-model with props
const addedItem = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value)
  },
})

addedItem.value.stack_id = props.stackId
addedItem.value.todo_list_id = props.listId
addedItem.value.project_id = props.projectId

// ========== EMITS ==========
const emit = defineEmits(['save-add', 'cancel-add'])

// ========== KEYDOWNS ==========
useKeydowns({
  onSave: () => emit('save-add'),
  onCancel: () => emit('cancel-add'),
})
</script>

<template>
  <div class="addWrapper">
    <h2 class="addTitle">Add {{ itemType.charAt(0).toUpperCase() + itemType.slice(1, -1) }}</h2>

    <!-- TODO LIST -->
    <template v-if="itemType === 'todo_lists'">
      <div class="inputWrapper">
        <label for="listTitle">List Title</label>
        <input
          type="text"
          placeholder="List Title"
          spellcheck="false"
          v-model="addedItem.title"
        />
        <label for="listTag">List Tag</label>
        <select v-model="addedItem.tag_name">
          <option
            disabled
            value=""
          >
            Please select one
          </option>
          <option
            v-for="tag in allTags"
            :key="tag.id"
            :value="tag.title"
          >
            #{{ tag.title }}
          </option>
        </select>
        <label for="listProject">List Project</label>
        <select v-model="addedItem.project_id">
          <option
            disabled
            value=""
          >
            Please select one
          </option>
          <option
            v-for="project in allProjects"
            :key="project.id"
            :value="project.id"
          >
            #{{ project.title }}
          </option>
        </select>
      </div>
    </template>

    <!-- TODO ITEM -->
    <template v-if="itemType === 'todo_items'">
      <div class="inputWrapper">
        <label for="itemTitle">Item Title</label>
        <input
          type="text"
          placeholder="Item Title"
          spellcheck="false"
          v-model="addedItem.title"
        />
      </div>
    </template>

    <!-- IDEA -->
    <template v-if="itemType === 'ideas'">
      <div class="inputWrapper">
        <label for="title">Title</label>
        <input
          type="text"
          placeholder="Add Idea Title"
          spellcheck="false"
          v-model="addedItem.title"
        />
      </div>
      <div class="inputWrapper">
        <label for="description">Description</label>
        <textarea
          placeholder="Description"
          spellcheck="false"
          v-model="addedItem.description"
        ></textarea>
      </div>
    </template>

    <!-- HABIT STACK -->
    <template v-if="itemType === 'stacks'">
      <div class="inputWrapper">
        <label for="stackTitle">Stack Title</label>
        <input
          type="text"
          placeholder="Stack Title"
          spellcheck="false"
          v-model="addedItem.title"
        />
      </div>
    </template>

    <!-- HABIT -->
    <template v-if="itemType === 'habits'">
      <div class="inputWrapper">
        <label for="habitTitle">Habit Title</label>
        <input
          type="text"
          placeholder="Habit Title"
          spellcheck="false"
          v-model="addedItem.title"
        />
      </div>
      <div class="inputWrapper">
        <label for="habitTag">Tag</label>
        <select v-model="addedItem.tag_name">
          <option
            disabled
            value=""
          >
            Please select one
          </option>
          <option
            v-for="tag in allTags"
            :key="tag.id"
            :value="tag.title"
          >
            #{{ tag.title }}
          </option>
        </select>
      </div>
    </template>

    <!-- TAG -->
    <template v-if="itemType === 'tags'">
      <div class="inputWrapper">
        <label for="title">Title</label>
        <input
          type="text"
          placeholder="Add Tag Title"
          spellcheck="false"
          v-model="addedItem.title"
        />
      </div>
    </template>

    <!-- REWARD -->
    <template v-if="itemType === 'rewards'">
      <div class="inputWrapper">
        <label for="title">Title</label>
        <input
          type="text"
          placeholder="Add Reward Title"
          spellcheck="false"
          v-model="addedItem.title"
        />
      </div>
      <div class="inputWrapper">
        <label for="cost">Cost</label>
        <input
          type="number"
          placeholder="10"
          spellcheck="false"
          v-model.number="addedItem.cost"
        />
      </div>
      <div class="inputWrapper">
        <div class="repeatIconContainer">
          <RepeatIcon
            id="repeatIcon"
            :class="addedItem.repeatable ? 'repeatEnabled' : 'repeatDisabled'"
            @click="addedItem.repeatable = !addedItem.repeatable"
          />
        </div>
      </div>
    </template>

    <button
      @click="emit('save-add')"
      class="editButton saveButton"
    >
      Save
    </button>
    <button
      @click="emit('cancel-add')"
      class="editButton cancelButton"
    >
      Cancel
    </button>
  </div>
</template>
