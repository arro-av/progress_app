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
import { useIdeasStore } from '../stores/ideas'
import { storeToRefs } from 'pinia'
// Vue
import { onMounted, onUnmounted, toRaw, ref } from 'vue'
// Helpers & Composables
import { moveItem } from '../helpers/moveItem'

// ========== DATA ==========
const ideasStore = useIdeasStore()
const { ideas } = storeToRefs(ideasStore)

const { editEnabled, toggleEditEnabled } = useEditEnable()

// ========== LIFECYCLE ==========
onMounted(() => {
  ideasStore.init()
})

onUnmounted(() => {
  ideasStore.cleanupListeners()
})

// ========== EDITOR CONFIGS ==========
const { editingId, editedItemData, startEditing, cancelEditing, saveEditing, deleteEditing } =
  useEdit({
    editFn: ideasStore.editIdea,
    deleteFn: ideasStore.deleteIdea,
  })

// ========== ADDER CONFIGS ==========
const { isAdding, addedItemData, startAdding, cancelAdding, saveAdding } = useAdd({
  addFn: ideasStore.addIdea,
  itemType: 'ideas',
})

// ========== KEYDOWNS ==========
useKeydowns({
  onEdit: () => {
    if (editingId.value === null && !isAdding.value) {
      toggleEditEnabled()
    }
  },
})
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
          @click="editEnabled ? startEditing(idea, 'ideas') : null"
          @move-item="moveItem(toRaw(idea), 'ideas', $event)"
          @idea-to-project="ideasStore.convertIdeaToProject(idea.id)"
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
        v-if="editEnabled || ideas.length === 0"
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
