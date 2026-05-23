<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDealsStore } from '@/stores/deals.store'
import { useRealtime } from '@/composables/useRealtime'
import DealsToolbar from '@/components/deals/DealsToolbar.vue'
import DealsFiltersPanel from '@/components/deals/DealsFiltersPanel.vue'
import DealTable from '@/components/deals/DealTable.vue'
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
    <DealTable />
    <DealsPagination />
  </div>
</template>
