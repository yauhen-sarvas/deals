<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useSearch } from '@/composables/useSearch'

const { t } = useI18n()
const { localQuery, clearSearch } = useSearch()
</script>

<template>
  <div class="relative flex items-center">
    <svg
      class="pointer-events-none absolute left-3 h-4 w-4 text-gray-400"
      fill="none" stroke="currentColor" viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
    <input
      v-model="localQuery"
      type="text"
      :placeholder="t('deals.search.placeholder')"
      class="w-full rounded-md border border-gray-300 py-2 pl-10 pr-10 text-sm shadow-sm
             focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      @keydown.escape="clearSearch"
    />
    <button
      v-if="localQuery"
      class="absolute right-1.5 rounded p-1.5 text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
      :aria-label="t('deals.search.clear')"
      @click="clearSearch"
    >
      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>
