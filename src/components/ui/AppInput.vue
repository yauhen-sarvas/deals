<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  modelValue: string | number | null
  type?: 'text' | 'number' | 'date' | 'email' | 'search'
  placeholder?: string
  label?: string
  error?: string
  hideErrorText?: boolean
  disabled?: boolean
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null]
}>()

const focused = ref(false)

// Chrome ignores placeholder on type="date"; use type="text" until focused or has a value
const resolvedType = computed(() =>
  props.type === 'date' && !props.modelValue && !focused.value ? 'text' : props.type
)

const errorId = computed(() => props.id ? `${props.id}-error` : undefined)

function onInput(event: Event) {
  const target = event.target as HTMLInputElement
  if (props.type === 'number') {
    const num = target.value === '' ? null : parseFloat(target.value)
    emit('update:modelValue', num)
  } else {
    emit('update:modelValue', target.value)
  }
}
</script>

<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" :for="id" class="text-sm font-medium text-gray-700">{{ label }}</label>
    <input
      :id="id"
      :type="resolvedType"
      :value="modelValue ?? ''"
      :placeholder="placeholder"
      :disabled="disabled"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="error && errorId && !hideErrorText ? errorId : undefined"
      @focus="focused = true"
      @blur="focused = false"
      :class="[
        'rounded-md border px-3 py-2 text-sm shadow-sm transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
        'disabled:bg-gray-50 disabled:cursor-not-allowed',
        error ? 'border-red-400' : 'border-gray-300',
        props.type === 'number' ? '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none' : '',
      ]"
      @input="onInput"
    />
    <p v-if="error && !hideErrorText" :id="errorId" class="text-xs text-red-600" role="alert">{{ error }}</p>
  </div>
</template>
