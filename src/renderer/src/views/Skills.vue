<script setup>
// ========== IMPORTS ==========
// Icons
import PlusIcon from '../assets/plus.svg'
import DeleteIcon from '../assets/delete.svg'
// Composables
import { useKeydowns } from '../helpers/composables/useKeydowns'
import { useToasts } from '../helpers/composables/useToasts'
import { useRanks } from '../../../shared/utils/useRanks'
// Stores
import { useTagsStore } from '../stores/tags'
import { storeToRefs } from 'pinia'
// Vue
import { onMounted, onUnmounted, ref, nextTick } from 'vue'

// ========== DATA ==========
const tagsStore = useTagsStore()
const { tags } = storeToRefs(tagsStore)
const { addToast } = useToasts()
const { getTagRank } = useRanks()

const selectedTagId = ref(null)
const editingTagId = ref(null)
const draggedTagId = ref(null)
const editedTagData = ref({
  id: null,
  title: '',
  level: 1,
  exp_current: 0,
  exp_needed: 60,
  time_spent: 0,
  created_at: '',
  position: 0,
})

// ========== LIFECYCLE ==========
onMounted(() => {
  tagsStore.init()
})

onUnmounted(() => {
  tagsStore.cleanupListeners()
})

const addDefaultSkill = async () => {
  const result = await tagsStore.addTag({
    title: 'NewSkill',
  })

  addToast({ message: result.message, type: result.success ? 'success' : 'error' })
}

const selectTag = (tag) => {
  selectedTagId.value = tag.id
}

const startEditingTag = async (tag) => {
  selectedTagId.value = tag.id
  editingTagId.value = tag.id
  editedTagData.value = {
    ...tag,
  }

  await nextTick()
}

const saveSelectedTag = async () => {
  if (editingTagId.value === null) return

  const result = await tagsStore.editTag({
    ...editedTagData.value,
  })

  addToast({ message: result.message, type: result.success ? 'success' : 'error' })

  if (result.success) {
    editingTagId.value = null
  }
}

const cancelSelectedTag = () => {
  editingTagId.value = null
}

const clearSelection = () => {
  if (editingTagId.value !== null) return
  selectedTagId.value = null
}

const moveTagToPosition = async (draggedTag, targetTag) => {
  const fromPosition = draggedTag.position
  const toPosition = targetTag.position

  if (fromPosition === toPosition) return

  const direction = fromPosition < toPosition ? 'down' : 'up'
  const steps = Math.abs(toPosition - fromPosition)
  const movingTag = { ...draggedTag }

  for (let step = 0; step < steps; step++) {
    const result = await window.api.moveItem(movingTag, 'tags', direction)
    if (!result.success) {
      addToast({ message: result.message, type: 'error' })
      return
    }

    movingTag.position = direction === 'down' ? movingTag.position + 1 : movingTag.position - 1
  }
}

const onDragStart = (tag) => {
  if (editingTagId.value !== null) return
  draggedTagId.value = tag.id
  selectedTagId.value = tag.id
}

const onDragEnd = () => {
  draggedTagId.value = null
}

const onDragOver = (event) => {
  event.preventDefault()
}

const onDrop = async (targetTag) => {
  if (draggedTagId.value === null || draggedTagId.value === targetTag.id) {
    draggedTagId.value = null
    return
  }

  const draggedTag = tags.value.find((tag) => tag.id === draggedTagId.value)
  if (!draggedTag) {
    draggedTagId.value = null
    return
  }

  await moveTagToPosition(draggedTag, targetTag)
  draggedTagId.value = null
}

const onDropDelete = async () => {
  if (draggedTagId.value === null) return

  const result = await tagsStore.deleteTag(draggedTagId.value)
  addToast({ message: result.message, type: result.success ? 'warning' : 'error' })

  if (result.success && selectedTagId.value === draggedTagId.value) {
    selectedTagId.value = null
    editingTagId.value = null
  }

  draggedTagId.value = null
}

const getRankClass = (tag) => `rank-${getTagRank(tag)}`

useKeydowns({
  onSave: saveSelectedTag,
  onCancel: cancelSelectedTag,
})
</script>

<template>
  <div
    class="skillsView"
    @click="clearSelection"
  >
    <div
      class="addSkill"
      @click.stop="addDefaultSkill"
    >
      <p>Add Skill</p>
      <PlusIcon class="addIcon" />
    </div>

    <div
      id="skillsWrapper"
      class="moduleWrapper"
    >
      <div
        v-for="tag in tags"
        :key="tag.id"
        class="skillItemContainer"
      >
        <div
          class="cardWrapper"
          :class="{
            selected: selectedTagId === tag.id,
            editing: editingTagId === tag.id,
            dragging: draggedTagId === tag.id,
          }"
          :draggable="editingTagId !== tag.id"
          @click.stop="selectTag(tag)"
          @dblclick.stop="startEditingTag(tag)"
          @dragstart="onDragStart(tag)"
          @dragend="onDragEnd"
          @dragover="onDragOver"
          @drop="onDrop(tag)"
        >
          <div class="rankLabel">
            <p :class="getRankClass(tag)">{{ getTagRank(tag) }}</p>
          </div>

          <template v-if="editingTagId !== tag.id">
            <div class="cardContent">
              <h4 :class="getRankClass(tag)">{{ tag.title }}</h4>
              <p
                class="skillLevel"
                :class="getRankClass(tag)"
              >
                Level {{ tag.level }}
              </p>
              <p class="skillExp">
                <span :class="getRankClass(tag)">{{ tag.exp_current }}</span>
                <span class="skillExpSecondary">/</span>
                <span class="skillExpSecondary">{{ tag.exp_needed }}</span>
              </p>
            </div>

            <progress
              class="expBar"
              :class="getRankClass(tag)"
              :value="tag.exp_current"
              :max="tag.exp_needed"
            >
              EXP
            </progress>
          </template>

          <template v-else>
            <div class="cardContent editingContent">
              <input
                v-model="editedTagData.title"
                class="skillTitleInput"
                :class="getRankClass(tag)"
                type="text"
                spellcheck="false"
                @click.stop
              />
            </div>

            <div class="editActions">
              <button
                class="skillActionButton muted"
                @click.stop="cancelSelectedTag"
              >
                Cancel
              </button>
              <button
                class="skillActionButton primary"
                @click.stop="saveSelectedTag"
              >
                Save
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>

    <div
      v-if="draggedTagId !== null"
      class="deleteDropzone"
      @click.stop
      @dragover.prevent
      @drop.prevent="onDropDelete"
    >
      <DeleteIcon class="deleteDropzoneIcon" />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../styles/base_card.css' as *;
@use '../styles/variables.scss' as *;

.addSkill {
  cursor: pointer;

  display: flex;
  justify-content: space-between;
  align-items: center;

  margin-top: 40px;
  background-color: $card-background-color;
  border-radius: 2px;

  width: 250px;
  height: 40px;
  padding: 0 8px;
  transition: all 0.3s ease;

  p {
    font-family: 'Inter', sans-serif;
    font-weight: 500;
    font-size: 16px;
    color: $accent-color;
    margin-right: -7px;
  }

  .addIcon {
    scale: 0.75;
    fill: $accent-color;
  }

  &:hover {
    background-color: $accent-color;

    .addIcon {
      fill: $card-background-color;
    }

    p {
      color: $card-background-color;
    }
  }
}

#skillsWrapper {
  display: grid;
  grid-template-columns: repeat(3, 250px);
  grid-auto-rows: 80px;
  gap: 10px;
  margin-top: 20px;
}

.cardWrapper {
  height: 80px;
  cursor: pointer;

  &.editing {
    outline: 1px solid rgba($accent-color, 0.75);
    box-shadow: 0 0 0 1px rgba($accent-color, 0.2);
  }

  &.dragging {
    opacity: 0.55;
  }
}

.cardContent {
  h4 {
    font-family: 'Inter', sans-serif;
    font-weight: 500;
    font-size: 16px;
    margin: auto 0;
    height: fit-content;

    cursor: pointer;

    position: absolute;
    left: 4%;
    top: 12%;
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
  .skillTitleInput {
    position: absolute;
    left: 4%;
    top: 14%;
    width: 62%;
    font-size: 14px;
  }
}

.skillTitleInput {
  border: none;
  outline: none;
  border-radius: 2px;
  background-color: $card-edit-background-color;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  padding: 4px 6px;
}

.skillLevel {
  position: absolute;
  right: 8%;
  bottom: 15%;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 14px;
}

.skillExp {
  position: absolute;
  left: 8%;
  bottom: 15%;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 14px;
}

.skillExpSecondary {
  color: $secondary-text-color;
}

.rankLabel {
  position: absolute;
  right: 4%;
  top: 12%;

  p {
    font-family: 'Inter', sans-serif;
    font-weight: 400;
    font-size: 11px;
    text-transform: uppercase;
    opacity: 0.65;
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

.expBar {
  position: absolute;
  left: 15px;
  bottom: 5px;
  width: 220px;
  height: 5px;
  border-radius: 5px;
  opacity: 0.5;
}

progress::-webkit-progress-bar {
  background-color: $main-background-color;
  border-radius: 5px;
}

progress::-webkit-progress-value {
  border-radius: 5px;
}

.editActions {
  position: absolute;
  right: 4%;
  bottom: 10%;
  display: flex;
  gap: 4px;
}

.skillActionButton {
  border: none;
  border-radius: 2px;
  padding: 5px 8px;
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;

  &.primary {
    background-color: $accent-color;
    color: $main-background-color;
    opacity: 0.5;
    transition: opacity 0.2s ease;

    &:hover {
      opacity: 1;
    }
  }

  &.muted {
    background-color: rgba(255, 255, 255, 0.07);
    color: $main-txt-color;
    opacity: 0.5;
    transition: opacity 0.2s ease;

    &:hover {
      opacity: 1;
    }
  }
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
