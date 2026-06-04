<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUiStore } from '@/stores/ui.store'
import DealFilters from './DealFilters.vue'

const { t } = useI18n()
const uiStore = useUiStore()

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && uiStore.isFiltersOpen) uiStore.closeFilters()
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <transition
    enter-active-class="transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]"
    enter-from-class="opacity-0 -translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition-all duration-150 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 -translate-y-2"
  >
    <div
      v-if="uiStore.isFiltersOpen"
      role="region"
      :aria-label="t('deals.filters.title')"
      class="rounded-lg border border-gray-200 bg-white shadow-sm"
    >
      <div class="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h2 class="text-sm font-semibold text-gray-700">{{ t('deals.filters.title') }}</h2>
        <button
          :aria-label="t('common.close')"
          class="rounded p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          @click="uiStore.closeFilters"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div class="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        <DealFilters />
      </div>
    </div>
  </transition>
</template>
