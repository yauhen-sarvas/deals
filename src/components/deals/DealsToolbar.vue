<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDealsStore } from '@/stores/deals.store'
import { PAGE_SIZE_OPTIONS } from '@/constants/pagination'
import { useUiStore } from '@/stores/ui.store'
import DealSearch from './DealSearch.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppBadge from '@/components/ui/AppBadge.vue'

const { t } = useI18n()
const store = useDealsStore()
const uiStore = useUiStore()

const pageSizeOptions = PAGE_SIZE_OPTIONS
const localPageSize = computed(() => store.pagination.pageSize)
const isPageSizeOpen = ref(false)

function changePageSize(size: number) {
  store.setPageSize(size)
  store.fetchDealsList()
}

function clearAll() {
  store.clearFilters()
  store.setSearch('')
  store.fetchDealsList()
}
</script>

<template>
  <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div class="flex-1 max-w-md">
      <DealSearch />
    </div>

    <div class="flex items-center gap-2">
      <AppButton variant="secondary" size="sm" @click="uiStore.toggleFilters">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
        </svg>
        {{ t('deals.filters.title') }}
        <AppBadge v-if="store.activeFilterCount > 0" variant="info" class="ml-1">
          {{ store.activeFilterCount }}
        </AppBadge>
      </AppButton>

      <AppButton
        v-if="!uiStore.isFiltersOpen && store.activeFilterCount > 0"
        variant="warning"
        size="sm"
        @click="clearAll"
      >
        {{ t('common.clearFilters') }}
      </AppButton>

      <div class="relative">
        <label for="page-size-select" class="sr-only">{{ t('deals.pagination.pageSize') }}</label>
        <select
          id="page-size-select"
          :value="localPageSize"
          class="appearance-none rounded-md border border-gray-300 px-2 pr-6 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          @focus="isPageSizeOpen = true"
          @blur="isPageSizeOpen = false"
          @change="changePageSize(parseInt(($event.target as HTMLSelectElement).value, 10)); isPageSizeOpen = false"
        >
          <option v-for="size in pageSizeOptions" :key="size" :value="size">{{ size }}</option>
        </select>
        <div class="pointer-events-none absolute inset-y-0 right-2 flex items-center">
          <svg
            class="h-3.5 w-3.5 text-gray-400 transition-transform duration-200"
            :class="isPageSizeOpen ? 'rotate-180' : ''"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>
