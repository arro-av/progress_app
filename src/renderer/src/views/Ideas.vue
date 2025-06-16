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
import { useUniversals } from '../helpers/db_functions/useUniversals'
import { useIdeas } from '../helpers/db_functions/useIdeas'
import { useEdit } from '../helpers/composables/useEdit'
import { useAdd } from '../helpers/composables/useAdd'
import { useSort } from '../helpers/composables/useSort'

// Vue
import { onMounted, onUnmounted, ref } from 'vue'

// ========== DATA ==========
const { items, getItems, deleteItem, moveItem } = useUniversals()
const { editIdea, addIdea, convertIdeaToProject, onIdeasUpdate } = useIdeas()
const { sortByPosition } = useSort()

let cleanupIdeaUpdate = null

const ideas = ref([])

// ========== LIFECYCLE ==========
onMounted(async () => {
  ideas.value = sortByPosition(await getItems('ideas'))

  cleanupIdeaUpdate = onIdeasUpdate(async () => {
    ideas.value = sortByPosition(await getItems('ideas'))
  })
})

onUnmounted(async () => {
  if (cleanupIdeaUpdate) {
    await cleanupIdeaUpdate()
  }
})

// ========== EDITOR CONFIGS ==========
const { editingId, editedItemData, startEditing, cancelEditing, saveEditing, deleteEditing } =
  useEdit({
    editFn: editIdea,
    deleteFn: deleteItem,
  })

// ========== ADDER CONFIGS ==========
const { isAdding, addedItemData, startAdding, cancelAdding, saveAdding } = useAdd({
  addFn: addIdea,
  itemType: 'ideas',
})

// ========== FUNCTIONS ==========
</script>

<template>
  <ModuleTitle title="Ideas" />

  <div
    id="ideasWrapper"
    class="moduleWrapper"
  >
    <!-- Idea Card START -->
    <div
      id="ideaCard"
      v-for="idea in ideas"
      :key="idea.id"
    >
      <!-- Show Card if not editing a specific idea -->
      <template v-if="editingId !== idea.id">
        <Card
          :itemData="idea"
          :itemType="'ideas'"
          @start-edit="startEditing(idea, 'ideas')"
          @move-item="moveItem(idea, 'ideas', $event)"
          @idea-to-project="convertIdeaToProject(idea.id)"
        />
      </template>

      <!-- Show EditItem if editing a specific idea -->
      <template v-else>
        <EditItem
          :itemType="'ideas'"
          v-model="editedItemData"
          @save-edit="saveEditing"
          @cancel-edit="cancelEditing"
          @delete-edit="deleteEditing"
        />
      </template>
    </div>

    <!-- Show AddIcon -->
    <template v-if="!isAdding">
      <div
        class="addIdeaWrapper"
        @click="startAdding()"
      >
        <PlusIcon class="addIcon" />
      </div>
    </template>
    <!-- Show AddItem if adding button is clicked -->
    <template v-else>
      <AddItem
        :itemType="'ideas'"
        v-model="addedItemData"
        @save-add="saveAdding()"
        @cancel-add="cancelAdding()"
      />
    </template>
  </div>
</template>
