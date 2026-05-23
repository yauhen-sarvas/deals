<script setup lang="ts">
defineProps<{
  modelValue: boolean
  label: string
  id?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<template>
  <label :for="id" class="flex items-center gap-2 cursor-pointer select-none group">
    <input
      :id="id"
      type="checkbox"
      :checked="modelValue"
      class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
      @change="emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
    />
    <span class="text-sm text-gray-700 group-hover:text-gray-900">{{ label }}</span>
  </label>
</template>
