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
import { storeToRefs } from 'pinia'
// Vue
import { onMounted, onUnmounted, toRaw } from 'vue'
// Helpers
import { moveItem } from '../helpers/moveItem'

// ========== DATA ==========
const tagsStore = useTagsStore()
const { tags } = storeToRefs(tagsStore)

const { editEnabled, toggleEditEnabled } = useEditEnable()

// ========== LIFECYCLE ==========
onMounted(() => {
  tagsStore.init()
})

onUnmounted(() => {
  tagsStore.cleanupListeners()
})

// ========== EDITOR CONFIGS ==========
const { editingId, editedItemData, startEditing, cancelEditing, saveEditing, deleteEditing } =
  useEdit({
    editFn: tagsStore.editTag,
    deleteFn: tagsStore.deleteTag,
  })

// ========== ADDER CONFIGS ==========
const { isAdding, addedItemData, startAdding, cancelAdding, saveAdding } = useAdd({
  addFn: tagsStore.addTag,
  itemType: 'tags',
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
  <ModuleTitle title="Tags" />

  <div
    id="tagsWrapper"
    class="moduleWrapper"
  >
    <div
      v-for="tag in tags"
      :key="tag.id"
      id="tagCard"
    >
      <!-- Show Card if not editing this specific tag -->
      <template v-if="editingId !== tag.id">
        <Card
          :itemData="tag"
          :itemType="'tags'"
          @click="editEnabled ? startEditing(tag, 'tags') : null"
          @move-item="moveItem(toRaw(tag), 'tags', $event)"
        />
      </template>

      <!-- Show EditItem if editing this specific tag -->
      <template v-else>
        <EditItem
          :itemType="'tags'"
          v-model="editedItemData"
          @save-edit="saveEditing()"
          @cancel-edit="cancelEditing()"
          @delete-edit="deleteEditing()"
        />
      </template>
    </div>
    <!-- Show AddIcon -->
    <template v-if="!isAdding">
      <div
        v-if="editEnabled || tags.length === 0"
        class="addTagWrapper"
        @click="startAdding()"
      >
        <PlusIcon class="addIcon" />
      </div>
    </template>
    <!-- Show AddItem if adding button is clicked -->
    <template v-else>
      <AddItem
        :itemType="'tags'"
        v-model="addedItemData"
        @save-add="saveAdding()"
        @cancel-add="cancelAdding()"
      />
    </template>
  </div>
</template>
