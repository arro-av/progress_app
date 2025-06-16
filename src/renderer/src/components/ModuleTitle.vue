<script setup>
import EditIcon from '../assets/edit.svg'

defineProps({
  title: String,
  isEditing: Boolean,
})

const emit = defineEmits(['update:isEditing'])
</script>

<template>
  <div class="module-title">
    <h1 class="module-title__text">{{ title }}</h1>
  </div>
</template>
