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
import { useProjects } from '../helpers/db_functions/useProjects'
import { useTodoLists } from '../helpers/db_functions/useTodoLists'
import { useTodoItems } from '../helpers/db_functions/useTodoItems'
import { useEdit } from '../helpers/composables/useEdit'
import { useAdd } from '../helpers/composables/useAdd'
import { useSort } from '../helpers/composables/useSort'
import { useProgressions } from '../../../shared/helpers/useProgressions.js'
import { useToasts } from '../helpers/composables/useToasts'

// Vue
import { onMounted, onUnmounted, ref, toRaw } from 'vue'
// ========= DATA =========
const { editProject, claimProjectReward, onProjectsUpdate } = useProjects()
const { addTodoList, editTodoList, claimTodoListReward, onTodoListsUpdate } = useTodoLists()
const { addTodoItem, editTodoItem, toggleTodoItemCompletion, onTodoItemsUpdate } = useTodoItems()
const { getItems, deleteItem, moveItem } = useUniversals()
const { sortByPosition } = useSort()
const { getTodoListProgressionReward, getProjectProgressionReward } = useProgressions()
const { addToast } = useToasts()

let cleanupProjectsUpdate = null
let cleanupTodoListsUpdate = null
let cleanupTodoItemsUpdate = null

const projects = ref([])
const todo_lists = ref([])
const todo_items = ref([])
const tags = ref([])
// ========= LIFECYCLE =========
onMounted(async () => {
  projects.value = await getItems('projects')
  todo_lists.value = sortByPosition(await getItems('todo_lists'))
  todo_items.value = sortByPosition(await getItems('todo_items'))
  tags.value = sortByPosition(await getItems('tags'))

  console.log(tags.value)

  cleanupProjectsUpdate = onProjectsUpdate(async () => {
    projects.value = await getItems('projects')
  })

  cleanupTodoListsUpdate = onTodoListsUpdate(async () => {
    todo_lists.value = sortByPosition(await getItems('todo_lists'))
  })

  cleanupTodoItemsUpdate = onTodoItemsUpdate(async () => {
    todo_items.value = sortByPosition(await getItems('todo_items'))
  })
})

onUnmounted(async () => {
  if (cleanupProjectsUpdate) {
    await cleanupProjectsUpdate()
  }

  if (cleanupTodoListsUpdate) {
    await cleanupTodoListsUpdate()
  }

  if (cleanupTodoItemsUpdate) {
    await cleanupTodoItemsUpdate()
  }
})

// ========== EDITOR CONFIGS ==========
// Project Editor
const {
  editingId: projectEditingId,
  editedItemData: projectEditedItemData,
  startEditing: projectStartEditing,
  cancelEditing: projectCancelEditing,
  saveEditing: projectSaveEditing,
  deleteEditing: projectDeleteEditing,
} = useEdit({
  editFn: editProject,
  deleteFn: deleteItem,
})

// Todo List Editor
const {
  editingId: listEditingId,
  editedItemData: listEditedItemData,
  startEditing: listStartEditing,
  cancelEditing: listCancelEditing,
  saveEditing: listSaveEditing,
  deleteEditing: listDeleteEditing,
} = useEdit({
  editFn: editTodoList,
  deleteFn: deleteItem,
})

// Todo Item Editor
const {
  editingId: itemEditingId,
  editedItemData: itemEditedItemData,
  startEditing: itemStartEditing,
  cancelEditing: itemCancelEditing,
  saveEditing: itemSaveEditing,
  deleteEditing: itemDeleteEditing,
} = useEdit({
  editFn: editTodoItem,
  deleteFn: deleteItem,
})

// ========= ADDER CONFIGS ==========
// Todo Item Adder
const {
  isAdding: itemIsAdding,
  addedItemData: itemAddedItemData,
  activeListId: itemActiveListId,
  startAdding: itemStartAdding,
  cancelAdding: itemCancelAdding,
  saveAdding: itemSaveAdding,
} = useAdd({
  addFn: addTodoItem,
  itemType: 'todo_items',
})

// Todo List Adder
const {
  isAdding: listIsAdding,
  addedItemData: listAddedItemData,
  startAdding: listStartAdding,
  cancelAdding: listCancelAdding,
  saveAdding: listSaveAdding,
} = useAdd({
  addFn: addTodoList,
  itemType: 'todo_lists',
})
</script>

<template>
  <ModuleTitle title="Projects" />

  <!-- TODO: Build Project Activation inside Projects UI | For now only available in Timer -> Pick project to work on -->
  <div
    v-for="project in projects.filter((project) => project.active)"
    :key="project.id"
    class="habitStackCard"
  >
    <div class="projectTitleWrapper">
      <template v-if="projectEditingId !== project.id && project.active">
        <Card
          :itemData="project"
          :itemType="'projects'"
          @start-edit="projectStartEditing(project, 'projects')"
          @move-item="moveItem(project, 'projects', $event)"
        />
      </template>

      <template v-else-if="projectEditingId === project.id && project.active">
        <EditItem
          :itemType="'projects'"
          v-model="projectEditedItemData"
          @save-edit="projectSaveEditing"
          @cancel-edit="projectCancelEditing"
          @delete-edit="projectDeleteEditing"
        />
      </template>

      <!-- TODO: Make this conditional readable | Checks if all todo lists in project are completed && if there is at least one todo list in project -> shows Claim Reward button if true -->
      <!-- TODO: Validate CLAIM on Backend only -->
      <div class="projectRewardWrapper">
        <div class="projectRewardText">
          <p>+{{ getProjectProgressionReward(project).crystals }} Crystals</p>
          <p>+{{ getProjectProgressionReward(project).userExp }} User-EXP</p>
        </div>

        <template v-if="project.completed">
          <button
            id="claimButtonActive"
            @click="claimProjectReward(toRaw(project))"
          >
            Claim
          </button>
        </template>
        <template v-else>
          <button @click="addToast({ message: 'Project not Completed!', type: 'warning' })">
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
        v-for="todo_list in todo_lists.filter((todo_list) => todo_list.project_id === project.id)"
        :key="todo_list.id"
        class="habitStackCard"
      >
        <div class="listTitleWrapper">
          <template v-if="listEditingId !== todo_list.id">
            <Card
              :itemData="todo_list"
              :itemType="'todo_lists'"
              @start-edit="listStartEditing(todo_list, 'todo_lists')"
              @move-item="moveItem(todo_list, 'todo_lists', $event)"
            />
          </template>

          <template v-else>
            <EditItem
              :itemType="'todo_lists'"
              v-model="listEditedItemData"
              @save-edit="listSaveEditing"
              @cancel-edit="listCancelEditing"
              @delete-edit="listDeleteEditing"
            />
          </template>
        </div>

        <div
          v-for="todo_item in todo_items.filter(
            (todo_item) => todo_item.todo_list_id === todo_list.id,
          )"
          :key="todo_item.id"
          id="todoCard"
        >
          <template v-if="itemEditingId !== todo_item.id">
            <Card
              :itemData="todo_item"
              :itemType="'todo_items'"
              @start-edit="itemStartEditing(todo_item, 'todo_items')"
              @toggle-completion="toggleTodoItemCompletion(todo_item)"
              @move-item="moveItem(todo_item, 'todo_items', $event)"
            />
          </template>
          <template v-else>
            <EditItem
              :itemType="'todo_items'"
              :allTags="tags"
              :allTodoLists="todo_lists"
              v-model="itemEditedItemData"
              @save-edit="itemSaveEditing"
              @cancel-edit="itemCancelEditing"
              @delete-edit="itemDeleteEditing"
            />
          </template>
        </div>

        <!--Show AddIcon -->
        <template v-if="!itemIsAdding">
          <div
            class="addTodoItemWrapper"
            @click="itemStartAdding(todo_list.id)"
          >
            <PlusIcon class="addIcon" />
          </div>
        </template>
        <!--Show AddItem if adding button is clicked-->
        <template v-else-if="itemIsAdding && todo_list.id == itemActiveListId">
          <AddItem
            :listId="todo_list.id"
            :itemType="'todo_items'"
            :allTodoLists="todo_lists"
            v-model="itemAddedItemData"
            @save-add="itemSaveAdding()"
            @cancel-add="itemCancelAdding()"
          />
        </template>

        <div class="todoRewardWrapper">
          <h4>Reward:</h4>
          <p>
            +{{
              getTodoListProgressionReward(
                todo_list,
                todo_items.filter((todo_item) => todo_item.todo_list_id === todo_list.id),
              ).crystals
            }}
            Crystals
          </p>
          <p>
            +{{
              getTodoListProgressionReward(
                todo_list,
                todo_items.filter((todo_item) => todo_item.todo_list_id === todo_list.id),
              ).tagExp
            }}
            Tag-EXP
          </p>
          <p>
            +{{
              getTodoListProgressionReward(
                todo_list,
                todo_items.filter((todo_item) => todo_item.todo_list_id === todo_list.id),
              ).userExp
            }}
            User-EXP
          </p>
          <!-- TODO: Make this conditional readable | Checks if all todo items in todo list are completed && if there is at least one todo item in todo list -> shows Claim Reward button if true -->
          <!-- TODO: Validate CLAIM on Backend only -->
          <template
            v-if="
              todo_items.filter(
                (todo_item) =>
                  todo_item.todo_list_id === todo_list.id && todo_item.completed === true,
              ).length ===
                todo_items.filter((todo_item) => todo_item.todo_list_id === todo_list.id).length &&
              todo_items.filter(
                (todo_item) =>
                  todo_item.todo_list_id === todo_list.id && todo_item.completed === true,
              ).length > 0
            "
          >
            <button
              id="claimButtonActive"
              @click="claimTodoListReward(toRaw(todo_list))"
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
      <template v-if="!listIsAdding">
        <div
          class="addTodoListWrapper"
          @click="listStartAdding()"
        >
          <p>Add Todolist</p>
        </div>
      </template>
      <template v-else-if="listIsAdding">
        <AddItem
          :itemType="'todo_lists'"
          :allTags="tags"
          :allProjects="projects"
          v-model="listAddedItemData"
          @save-add="listSaveAdding()"
          @cancel-add="listCancelAdding()"
        />
      </template>
    </div>
  </div>
</template>
