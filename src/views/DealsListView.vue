<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDealsStore } from '@/stores/deals.store'
import { useRealtime } from '@/composables/useRealtime'
import DealsToolbar from '@/components/deals/DealsToolbar.vue'
import DealsFiltersPanel from '@/components/deals/DealsFiltersPanel.vue'
import DealTable from '@/components/deals/DealTable.vue'
import DealDetailPanel from '@/components/deals/DealDetailPanel.vue'
import ErrorBoundary from '@/components/common/ErrorBoundary.vue'
import DealsPagination from '@/components/deals/DealsPagination.vue'

const { t } = useI18n()
const store = useDealsStore()
useRealtime()

onMounted(() => { store.fetchDealsList() })
</script>

<template>
  <div class="flex flex-col gap-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">{{ t('deals.title') }}</h1>
      <p class="mt-1 text-sm text-gray-500">{{ t('deals.subtitle') }}</p>
    </div>

    <DealsToolbar />
    <DealsFiltersPanel />

    <!-- Table + detail panel: stacked on mobile, side-by-side on large screens -->
    <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
      <div v-if="store.selectedDealId" class="sticky top-[4.5rem] max-h-[calc(100vh-5.5rem)] lg:order-last lg:w-[420px] lg:shrink-0 lg:mt-8">
        <ErrorBoundary>
          <DealDetailPanel />
        </ErrorBoundary>
      </div>

      <div class="flex flex-col gap-4 min-w-0 flex-1">
        <ErrorBoundary>
          <DealTable />
        </ErrorBoundary>
        <DealsPagination />
      </div>
    </div>
  </div>
</template>
