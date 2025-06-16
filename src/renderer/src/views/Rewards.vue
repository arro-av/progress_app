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
import { useRewardsStore } from '../stores/rewards'
import { storeToRefs } from 'pinia'
// Vue
import { onMounted, onUnmounted, toRaw, ref } from 'vue'
// Helpers & Composables
import { moveItem } from '../helpers/moveItem'

// ========== DATA ==========
const rewardsStore = useRewardsStore()
const { rewards } = storeToRefs(rewardsStore)

const { editEnabled, toggleEditEnabled } = useEditEnable()

// ========== LIFECYCLE ==========
onMounted(() => {
  rewardsStore.init()
})

onUnmounted(() => {
  rewardsStore.cleanupListeners()
})

// ========== EDITOR CONFIGS ==========
const { editingId, editedItemData, startEditing, cancelEditing, saveEditing, deleteEditing } =
  useEdit({
    editFn: rewardsStore.editReward,
    deleteFn: rewardsStore.deleteReward,
  })

// ========== ADDER CONFIGS ==========
const { isAdding, addedItemData, startAdding, cancelAdding, saveAdding } = useAdd({
  addFn: rewardsStore.addReward,
  itemType: 'rewards',
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
  <ModuleTitle title="Rewards" />

  <div
    id="rewardsWrapper"
    class="moduleWrapper"
  >
    <div
      v-for="reward in rewards"
      :key="reward.id"
      class="rewardItemContainer"
    >
      <!-- Show Card if not editing a specific reward -->
      <template v-if="editingId !== reward.id">
        <Card
          :itemData="reward"
          :itemType="'rewards'"
          @click="editEnabled ? startEditing(reward, 'rewards') : null"
          @unlock-reward="!editEnabled ? rewardsStore.unlockReward(toRaw(reward)) : null"
          @move-item="moveItem(toRaw(reward), 'rewards', $event)"
        />
      </template>
      <!-- Show EditItem if editing a specific reward -->
      <template v-else>
        <EditItem
          :itemType="'rewards'"
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
        v-if="editEnabled || rewardsStore.rewards.length === 0"
        class="addRewardWrapper"
        @click="startAdding()"
      >
        <PlusIcon class="addIcon" />
      </div>
    </template>
    <!-- Show AddItem if adding button is clicked -->
    <template v-else>
      <AddItem
        :itemType="'rewards'"
        v-model="addedItemData"
        @save-add="saveAdding()"
        @cancel-add="cancelAdding()"
      />
    </template>
  </div>
</template>
