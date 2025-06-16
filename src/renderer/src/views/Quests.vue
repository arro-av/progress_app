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
import { useQuestsStore } from '../stores/quests'
import { storeToRefs } from 'pinia'
// Vue
import { onMounted, onUnmounted, toRaw } from 'vue'
// Helpers
import { moveItem } from '../helpers/moveItem'
import { useProgressions } from '../../../shared/helpers/useProgressions'
import { useToasts } from '../helpers/composables/useToasts'
// ========== DATA ==========
const questsStore = useQuestsStore()
const { questlines } = storeToRefs(questsStore)
const { quests } = storeToRefs(questsStore)
const { tasks } = storeToRefs(questsStore)

const tagsStore = useTagsStore()
const { tags } = storeToRefs(tagsStore)

const { editEnabled, toggleEditEnabled } = useEditEnable()

const { getQuestlineProgressionReward, getQuestProgressionReward } = useProgressions()

const { addToast } = useToasts()

// ========= LIFECYCLE =========
onMounted(async () => {
  questsStore.init()
  tagsStore.init()
})

onUnmounted(async () => {
  questsStore.cleanupListeners()
  tagsStore.cleanupListeners()
})

// ========== EDITOR CONFIGS ==========
// Questline Editor
const {
  editingId: questlineEditingId,
  editedItemData: questlineEditedItemData,
  startEditing: questlineStartEditing,
  cancelEditing: questlineCancelEditing,
  saveEditing: questlineSaveEditing,
  deleteEditing: questlineDeleteEditing,
} = useEdit({
  editFn: questsStore.editQuestline,
  deleteFn: questsStore.deleteQuestline,
})

// Quests Editor
const {
  editingId: questEditingId,
  editedItemData: questEditedItemData,
  startEditing: questStartEditing,
  cancelEditing: questCancelEditing,
  saveEditing: questSaveEditing,
  deleteEditing: questDeleteEditing,
} = useEdit({
  editFn: questsStore.editQuest,
  deleteFn: questsStore.deleteQuest,
})

// Task Editor
const {
  editingId: taskEditingId,
  editedItemData: taskEditedItemData,
  startEditing: taskStartEditing,
  cancelEditing: taskCancelEditing,
  saveEditing: taskSaveEditing,
  deleteEditing: taskDeleteEditing,
} = useEdit({
  editFn: questsStore.editTask,
  deleteFn: questsStore.deleteTask,
})

// ========= ADDER CONFIGS ==========
// Task Adder
const {
  isAdding: taskIsAdding,
  addedItemData: taskAddedItemData,
  activeListId: taskActiveListId,
  startAdding: taskStartAdding,
  cancelAdding: taskCancelAdding,
  saveAdding: taskSaveAdding,
} = useAdd({
  addFn: questsStore.addTask,
  itemType: 'tasks',
})

// Quest Adder
const {
  isAdding: questIsAdding,
  addedItemData: questAddedItemData,
  startAdding: questStartAdding,
  cancelAdding: questCancelAdding,
  saveAdding: questSaveAdding,
} = useAdd({
  addFn: questsStore.addQuest,
  itemType: 'quests',
})
// ========== KEYDOWNS ==========
useKeydowns({
  onEdit: () => {
    if (
      !questlineEditingId.value &&
      !questEditingId.value &&
      !questIsAdding.value &&
      !taskEditingId.value &&
      !taskIsAdding.value
    ) {
      toggleEditEnabled()
    }
  },
})
</script>

<template>
  <ModuleTitle title="Quests" />

  <!-- TODO: Build Project Activation inside Projects UI | For now only available in Timer -> Pick project to work on -->
  <div
    v-for="questline in questlines.filter((questline) => questline.active)"
    :key="questline.id"
    class="habitStackCard"
  >
    <div class="projectTitleWrapper">
      <template v-if="questlineEditingId !== questline.id && questline.active">
        <Card
          :itemData="questline"
          :itemType="'questlines'"
          @click="editEnabled ? questlineStartEditing(questline, 'questlines') : null"
        />
      </template>

      <template v-else-if="questlineEditingId === questline.id && questline.active">
        <EditItem
          :itemType="'questlines'"
          v-model="questlineEditedItemData"
          @save-edit="questlineSaveEditing"
          @cancel-edit="questlineCancelEditing"
          @delete-edit="questlineDeleteEditing"
        />
      </template>

      <div class="projectRewardWrapper">
        <template v-if="questline.completed">
          <div class="projectRewardText">
            <p>+{{ getQuestlineProgressionReward(questline).crystals }} Crystals</p>
            <p>+{{ getQuestlineProgressionReward(questline).userExp }} User-EXP</p>
          </div>
          <button
            v-if="questline.completed"
            id="claimButtonActive"
            @click="questsStore.claimQuestlineReward(toRaw(questline))"
          >
            Claim
          </button>
        </template>
      </div>
    </div>

    <div
      id="habitsWrapper"
      class="moduleWrapper"
    >
      <div
        v-for="quest in quests.filter((quest) => quest.questline_id === questline.id)"
        :key="quest.id"
        class="habitStackCard"
      >
        <div class="listTitleWrapper">
          <template v-if="questEditingId !== quest.id">
            <Card
              :itemData="quest"
              :itemType="'quests'"
              @click="editEnabled ? questStartEditing(quest, 'quests') : null"
              @move-item="moveItem(toRaw(quest), 'quests', $event)"
            />
          </template>

          <template v-else>
            <EditItem
              :itemType="'quests'"
              :allTags="tags"
              v-model="questEditedItemData"
              @save-edit="questSaveEditing"
              @cancel-edit="questCancelEditing"
              @delete-edit="questDeleteEditing"
            />
          </template>
        </div>

        <div
          v-for="task in tasks.filter((task) => task.quest_id === quest.id)"
          :key="task.id"
          id="todoCard"
        >
          <template v-if="taskEditingId !== task.id">
            <Card
              :itemData="task"
              :itemType="'tasks'"
              @click="editEnabled ? taskStartEditing(task, 'tasks') : null"
              @toggle-completion="questsStore.toggleTaskCompletion(task)"
              @move-item="moveItem(toRaw(task), 'tasks', $event)"
            />
          </template>
          <template v-else>
            <EditItem
              :itemType="'tasks'"
              :allTags="tags"
              :allQuests="quests"
              v-model="taskEditedItemData"
              @save-edit="taskSaveEditing"
              @cancel-edit="taskCancelEditing"
              @delete-edit="taskDeleteEditing"
            />
          </template>
        </div>

        <!--Show AddIcon -->
        <template v-if="!taskIsAdding">
          <div
            v-if="editEnabled || tasks.filter((task) => task.quest_id === quest.id).length === 0"
            class="addTodoItemWrapper"
            @click="taskStartAdding(quest.id)"
          >
            <PlusIcon class="addIcon" />
          </div>
        </template>
        <!--Show AddItem if adding button is clicked-->
        <template v-else-if="taskIsAdding && quest.id == taskActiveListId">
          <AddItem
            :questId="quest.id"
            :itemType="'tasks'"
            :allQuests="quests"
            v-model="taskAddedItemData"
            @save-add="taskSaveAdding()"
            @cancel-add="taskCancelAdding()"
          />
        </template>

        <div class="todoRewardWrapper">
          <h4>Reward:</h4>
          <p>
            +{{
              getQuestProgressionReward(
                quest,
                tasks.filter((task) => task.quest_id === quest.id),
              ).crystals
            }}
            Crystals
          </p>
          <p>
            +{{
              getQuestProgressionReward(
                quest,
                tasks.filter((task) => task.quest_id === quest.id),
              ).tagExp
            }}
            Tag-EXP
          </p>
          <p>
            +{{
              getQuestProgressionReward(
                quest,
                tasks.filter((task) => task.quest_id === quest.id),
              ).userExp
            }}
            User-EXP
          </p>
          <template
            v-if="
              tasks.filter((task) => task.quest_id === quest.id && task.completed === true)
                .length === tasks.filter((task) => task.quest_id === quest.id).length &&
              tasks.filter((task) => task.quest_id === quest.id && task.completed === true).length >
                0
            "
          >
            <button
              id="claimButtonActive"
              @click="questsStore.claimQuestReward(toRaw(quest))"
            >
              Claim
            </button>
          </template>
          <template v-else>
            <button @click="addToast({ message: 'Tasks not completed!', type: 'warning' })">
              Claim
            </button>
          </template>
        </div>
      </div>
      <!-- TODO: Add Todo List | For now diabled | Add manually in DB-->
      <template v-if="!questIsAdding">
        <div
          v-if="
            editEnabled ||
            quests.filter((quest) => quest.questline_id === questline.id).length === 0
          "
          class="addTodoListWrapper"
          @click="questStartAdding()"
        >
          <p>Add Quest</p>
        </div>
      </template>
      <template v-else-if="questIsAdding">
        <AddItem
          :itemType="'quests'"
          :questlineId="questline.id"
          :allTags="tags"
          v-model="questAddedItemData"
          @save-add="questSaveAdding()"
          @cancel-add="questCancelAdding()"
        />
      </template>
    </div>
  </div>
</template>
