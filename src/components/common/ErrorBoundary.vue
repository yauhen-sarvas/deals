<script setup lang="ts">
import { onErrorCaptured, ref } from 'vue'

const error = ref<Error | null>(null)

onErrorCaptured((err) => {
  error.value = err instanceof Error ? err : new Error(String(err))
  return false
})

function retry() {
  error.value = null
}
</script>

<template>
  <slot v-if="!error" />
  <div v-else class="flex flex-col items-center justify-center gap-4 py-16 text-center">
    <div class="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
      <svg class="h-7 w-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
    </div>
    <p class="text-sm text-gray-500">{{ error.message }}</p>
    <button
      class="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors"
      @click="retry"
    >
      Retry
    </button>
  </div>
</template>
