<script setup>
// ========== IMPORTS ==========
// Vue
import { computed, ref, onMounted } from 'vue'
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
      ['rewards', 'tags', 'ideas', 'habits', 'stacks', 'quests', 'tasks', 'questlines'].includes(
        value,
      ),
  },
  allTags: {
    type: Array,
    default: () => [],
  },
  allHabitStacks: {
    type: Array,
    default: () => [],
  },
  allQuestLines: {
    type: Array,
    default: () => [],
  },
})

const confirmDelete = ref(false)

// ========== EMITS ==========
const emit = defineEmits(['update:modelValue', 'save-edit', 'cancel-edit', 'delete-edit'])

// ========== COMPUTED ==========
// Syncs v-model with props
const editableItem = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value)
  },
})

// ========== KEYDOWNS ==========
useKeydowns({
  onSave: () => emit('save-edit'),
  onCancel: () => emit('cancel-edit'),
  onDelete: () =>
    confirmDelete.value === false ? (confirmDelete.value = true) : emit('delete-edit'), //delete only on double Keydown -> 2x'DELETE'
})

const titleInput = ref(null)
onMounted(() => {
  if (titleInput.value) titleInput.value.focus()
})
</script>

<template>
  <div class="editWrapper">
    <h2 class="editTitle">Edit {{ itemType.charAt(0).toUpperCase() + itemType.slice(1, -1) }}</h2>

    <!-- Questlines -->
    <template v-if="itemType === 'questlines'">
      <div class="inputWrapper">
        <label for="projectTitle">Project Title</label>
        <input
          ref="titleInput"
          type="text"
          placeholder="Project Title"
          spellcheck="false"
          v-model="editableItem.title"
        />
        <label for="projectDescription">Project Description</label>
        <textarea
          placeholder="Project Description"
          spellcheck="false"
          v-model="editableItem.description"
        ></textarea>
      </div>
    </template>

    <!-- QUEST -->
    <template v-if="itemType === 'quests'">
      <div class="inputWrapper">
        <label for="questTitle">Quest Title</label>
        <input
          ref="titleInput"
          type="text"
          placeholder="Quest Title"
          spellcheck="false"
          v-model="editableItem.title"
        />
        <label for="listTag">Tag</label>
        <select v-model="editableItem.tag_id">
          <option
            disabled
            value=""
          >
            Select a tag
          </option>
          <option
            v-for="tag in allTags"
            :key="tag.id"
            :value="tag.id"
          >
            #{{ tag.title }}
          </option>
        </select>
      </div>
    </template>

    <!-- TASK -->
    <template v-if="itemType === 'tasks'">
      <div class="inputWrapper">
        <label for="itemTitle">Task Title</label>
        <input
          ref="titleInput"
          type="text"
          placeholder="Item Title"
          spellcheck="false"
          v-model="editableItem.title"
        />
      </div>
    </template>

    <!-- TAG -->
    <template v-if="itemType === 'tags'">
      <div class="inputWrapper">
        <label for="title">Title</label>
        <input
          ref="titleInput"
          type="text"
          placeholder="Add Tag Title"
          spellcheck="false"
          v-model="editableItem.title"
        />
      </div>
    </template>

    <!-- REWARD -->
    <template v-if="itemType === 'rewards'">
      <div class="inputWrapper">
        <label for="title">Title</label>
        <input
          ref="titleInput"
          type="text"
          placeholder="Add Reward Title"
          spellcheck="false"
          v-model="editableItem.title"
        />
      </div>
      <div class="inputWrapper">
        <label for="cost">Cost</label>
        <input
          type="number"
          placeholder="10"
          spellcheck="false"
          v-model.number="editableItem.cost"
        />
      </div>
      <div class="inputWrapper">
        <div class="repeatIconContainer">
          <RepeatIcon
            id="repeatIcon"
            :class="editableItem.repeatable ? 'repeatEnabled' : 'repeatDisabled'"
            @click="editableItem.repeatable = !editableItem.repeatable"
          />
        </div>
      </div>
    </template>

    <button
      @click="emit('save-edit')"
      class="editButton saveButton"
    >
      Save
    </button>
    <button
      @click="emit('cancel-edit')"
      class="editButton cancelButton"
    >
      Cancel
    </button>
    <button
      v-if="confirmDelete == false"
      @click="confirmDelete = true"
      class="editButton deleteButton"
    >
      Delete {{ itemType.charAt(0).toUpperCase() + itemType.slice(1, -1) }}
    </button>
    <div
      v-else
      class="confirmationWrapper"
    >
      <p>
        Are you sure you want to delete this
        {{ itemType.charAt(0).toUpperCase() + itemType.slice(1, -1) }}?
      </p>
      <div class="confirmationButtons">
        <button
          @click="confirmDelete = false"
          class="deleteCancelButton"
        >
          Cancel
        </button>
        <button
          @click="emit('delete-edit')"
          class="deleteDeleteButton"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
</template>
