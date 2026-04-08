<script setup>
// ========== IMPORTS ==========
// Icons
import PlusIcon from '../assets/plus.svg'
import CrystalIcon from '../assets/crystal.svg'
import RepeatIcon from '../assets/repeat.svg'
import DeleteIcon from '../assets/delete.svg'
// Composables
import { useKeydowns } from '../helpers/composables/useKeydowns'
import { useToasts } from '../helpers/composables/useToasts'
// Stores
import { useRewardsStore } from '../stores/rewards'
import { storeToRefs } from 'pinia'
// Vue
import { onMounted, onUnmounted, ref, nextTick, toRaw } from 'vue'

// ========== DATA ==========
const rewardsStore = useRewardsStore()
const { rewards } = storeToRefs(rewardsStore)
const { addToast } = useToasts()

const selectedRewardId = ref(null)
const editingRewardId = ref(null)
const draggedRewardId = ref(null)
const editedRewardData = ref({
  id: null,
  title: '',
  cost: 1,
  repeatable: false,
  position: 0,
})

let rewardsNotificationCleanup = null
// ========== LIFECYCLE ==========
onMounted(() => {
  rewardsStore.init()
  rewardsNotificationCleanup = window.api.onRewardsUpdate(() => {
    rewardsStore.init()
  })
})

onUnmounted(() => {
  rewardsStore.cleanupListeners()
})

// Add a new reward with default values
const addDefaultReward = async () => {
  const result = await rewardsStore.addReward({
    title: 'New Reward',
    cost: 1,
    repeatable: false,
  })

  addToast({ message: result.message, type: result.success ? 'success' : 'error' })
}

// Select a reward forediting
const selectReward = (reward) => {
  selectedRewardId.value = reward.id
}

// Start editing a reward
const startEditingReward = async (reward) => {
  selectedRewardId.value = reward.id
  editingRewardId.value = reward.id
  editedRewardData.value = {
    id: reward.id,
    title: reward.title,
    cost: reward.cost,
    repeatable: reward.repeatable,
    position: reward.position,
  }

  await nextTick()
}

const saveSelectedReward = async () => {
  if (editingRewardId.value === null) return

  const result = await rewardsStore.editReward({
    ...editedRewardData.value,
    cost: Number(editedRewardData.value.cost),
  })

  addToast({ message: result.message, type: result.success ? 'success' : 'error' })

  if (result.success) {
    editingRewardId.value = null
  }
}

const cancelSelectedReward = () => {
  editingRewardId.value = null
}

const clearSelection = () => {
  if (editingRewardId.value !== null) return
  selectedRewardId.value = null
}

const moveRewardToPosition = async (draggedReward, targetReward) => {
  const fromPosition = draggedReward.position
  const toPosition = targetReward.position

  if (fromPosition === toPosition) return

  const direction = fromPosition < toPosition ? 'down' : 'up'
  const steps = Math.abs(toPosition - fromPosition)
  const movingReward = { ...draggedReward }

  for (let step = 0; step < steps; step++) {
    const result = await window.api.moveItem(movingReward, 'rewards', direction)
    if (!result.success) {
      addToast({ message: result.message, type: 'error' })
      return
    }

    movingReward.position =
      direction === 'down' ? movingReward.position + 1 : movingReward.position - 1
  }
}

const onDragStart = (reward) => {
  if (editingRewardId.value !== null) return
  draggedRewardId.value = reward.id
  selectedRewardId.value = reward.id
}

const onDragEnd = () => {
  draggedRewardId.value = null
}

const onDragOver = (event) => {
  event.preventDefault()
}

const onDrop = async (targetReward) => {
  if (draggedRewardId.value === null || draggedRewardId.value === targetReward.id) {
    draggedRewardId.value = null
    return
  }

  const draggedReward = rewards.value.find((reward) => reward.id === draggedRewardId.value)
  if (!draggedReward) {
    draggedRewardId.value = null
    return
  }

  await moveRewardToPosition(draggedReward, targetReward)
  draggedRewardId.value = null
}

const onDropDelete = async () => {
  if (draggedRewardId.value === null) return

  const result = await rewardsStore.deleteReward(draggedRewardId.value)
  addToast({ message: result.message, type: result.success ? 'warning' : 'error' })

  if (result.success && selectedRewardId.value === draggedRewardId.value) {
    selectedRewardId.value = null
    editingRewardId.value = null
  }

  draggedRewardId.value = null
}

useKeydowns({
  onSave: saveSelectedReward,
  onCancel: cancelSelectedReward,
})
</script>

<template>
  <div
    class="rewardsView"
    @click="clearSelection"
  >
    <div
      class="addReward"
      @click.stop="addDefaultReward"
    >
      <p>Add Reward</p>
      <PlusIcon class="addIcon" />
    </div>

    <div
      id="rewardsWrapper"
      class="moduleWrapper"
    >
      <div
        v-for="reward in rewards"
        :key="reward.id"
        class="rewardItemContainer"
      >
        <div
          class="cardWrapper"
          :class="{
            selected: selectedRewardId === reward.id,
            editing: editingRewardId === reward.id,
            dragging: draggedRewardId === reward.id,
          }"
          :draggable="editingRewardId !== reward.id"
          @click.stop="selectReward(reward)"
          @dblclick.stop="startEditingReward(reward)"
          @dragstart="onDragStart(reward)"
          @dragend="onDragEnd"
          @dragover="onDragOver"
          @drop="onDrop(reward)"
        >
          <template v-if="editingRewardId !== reward.id">
            <div class="cardContent">
              <h4>{{ reward.title }}</h4>
            </div>

            <RepeatIcon
              id="repeatIcon"
              :class="reward.repeatable ? 'repeatEnabled' : 'repeatDisabled'"
              @click.stop
            />

            <div class="cosstWrapper">
              <p>{{ reward.cost }}</p>
              <CrystalIcon class="crystalIcon" />
            </div>

            <div
              class="claimButton"
              @click.stop="rewardsStore.unlockReward(toRaw(reward))"
            >
              <p>Claim</p>
            </div>
          </template>

          <template v-else>
            <div class="cardContent editingContent">
              <input
                v-model="editedRewardData.title"
                class="rewardTitleInput"
                type="text"
                spellcheck="false"
                @click.stop
              />

              <div class="cosstWrapper editingCost">
                <input
                  v-model.number="editedRewardData.cost"
                  class="rewardCostInput"
                  type="number"
                  min="1"
                  @click.stop
                />
              </div>
            </div>

            <RepeatIcon
              id="repeatIcon"
              :class="editedRewardData.repeatable ? 'repeatEnabled' : 'repeatDisabled'"
              @click.stop="editedRewardData.repeatable = !editedRewardData.repeatable"
            />

            <div class="editActions">
              <button
                class="rewardActionButton muted"
                @click.stop="cancelSelectedReward"
              >
                Cancel
              </button>
              <button
                class="rewardActionButton primary"
                @click.stop="saveSelectedReward"
              >
                Save
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>

    <div
      v-if="draggedRewardId !== null"
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
@use '../styles/variables.scss' as *;
@use '../styles/base_card.css' as *;

.addReward {
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
    font-weight: 400;
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

#rewardsWrapper {
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

  h4 {
    font-family: 'Inter', sans-serif;
    font-weight: 500;
    font-size: 16px;
    color: $common-color;
    margin: auto 0;
    height: fit-content;

    cursor: pointer;

    position: absolute;
    left: 4%;
    top: 12%;
  }
}
.rewardTitleInput,
.rewardCostInput {
  border: none;
  outline: none;
  border-radius: 2px;
  background-color: $card-edit-background-color;
  font-family: 'Inter', sans-serif;
}

.rewardTitleInput {
  color: $common-color;
  position: absolute;
  left: 4%;
  top: 12%;

  width: 60%;
  padding: 4px 6px;
  font-size: 14px;
  font-weight: 500;
}

.rewardCostInput {
  color: $accent-color;
  position: absolute;
  left: 4%;
  bottom: 15%;
  width: 80px;
  height: fit-content;
  padding: 4px 6px;
  font-size: 14px;
  font-weight: 800;
}

.cosstWrapper {
  width: 60px;
  display: flex;
  width: fit-content;
  height: 23px;

  position: absolute;
  left: 4%;
  bottom: 5%;

  &.editingCost {
    width: fit-content;
    gap: 2px;
  }

  .crystalIcon {
    scale: 0.8;
    position: relative;
    top: -11px;
  }

  p {
    font-family: 'Inter', sans-serif;
    font-weight: 800;
    font-size: 14px;
    color: $accent-color;
    margin-right: -7px;
  }
}

.editActions {
  position: absolute;
  right: 4%;
  bottom: 10%;
  display: flex;
  gap: 4px;
}

.rewardActionButton {
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
    opacity: 50%;
    transition: opacity 0.2s ease;

    &:hover {
      opacity: 100%;
    }
  }

  &.muted {
    background-color: rgba(255, 255, 255, 0.07);
    color: $main-txt-color;
    opacity: 50%;
    transition: opacity 0.2s ease;

    &:hover {
      opacity: 100%;
    }
  }
}

.claimButton {
  cursor: pointer;
  width: fit-content;
  height: 23px;
  position: absolute;
  right: 4%;
  bottom: 12%;
  background-color: $accent-color;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 50%;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 100%;
  }

  p {
    font-family: 'Inter', sans-serif;
    font-weight: 800;
    font-size: 12px;
    color: $main-background-color;
    padding: 5px 10px;
  }
}

#repeatIcon {
  scale: 0.23;
  position: relative;
  left: 10%;
  top: -32%;

  opacity: 0.35;
  transition: opacity 0.2s ease-in-out;
  cursor: pointer;

  &.repeatEnabled {
    opacity: 1;
    fill: $accent-color;
    filter: drop-shadow(0px 0px 5px rgba(219, 185, 151, 0.2));
  }

  &.repeatDisabled {
    opacity: 0.35;
    fill: $main-txt-color;
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
