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
      ['rewards', 'tags', 'ideas', 'habits', 'stacks', 'questlines', 'quests', 'tasks'].includes(
        value,
      ),
  },
  allTags: {
    type: Array,
    default: () => [],
  },
  allQuests: {
    type: Array,
    default: () => [],
  },
  stackId: {
    type: Number,
    default: null,
  },
  questId: {
    type: Number,
    default: null,
  },
  questlineId: {
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
addedItem.value.quest_id = props.questId
addedItem.value.questline_id = props.questlineId

// ========== EMITS ==========
const emit = defineEmits(['save-add', 'cancel-add'])

// ========== KEYDOWNS ==========
useKeydowns({
  onSave: () => emit('save-add'),
  onCancel: () => emit('cancel-add'),
})

const titleInput = ref(null)
onMounted(() => {
  if (titleInput.value) titleInput.value.focus()
})
</script>

<template>
  <div class="addWrapper">
    <h2 class="addTitle">Add {{ itemType.charAt(0).toUpperCase() + itemType.slice(1, -1) }}</h2>

    <!-- QUESTS -->
    <template v-if="itemType === 'quests'">
      <div class="inputWrapper">
        <label for="listTitle">Title</label>
        <input
          ref="titleInput"
          type="text"
          placeholder="Quest Title"
          spellcheck="false"
          v-model="addedItem.title"
        />
        <label for="listTag">Tag</label>
        <select v-model="addedItem.tag_name">
          <option
            disabled
            value=""
          >
            Select a tag
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

    <!-- TASK -->
    <template v-if="itemType === 'tasks'">
      <div class="inputWrapper">
        <label for="itemTitle">Title</label>
        <input
          ref="titleInput"
          type="text"
          placeholder="Task Title"
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
          ref="titleInput"
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
        <label for="stackTitle">Title</label>
        <input
          ref="titleInput"
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
        <label for="habitTitle">Title</label>
        <input
          ref="titleInput"
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
          ref="titleInput"
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
          ref="titleInput"
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
