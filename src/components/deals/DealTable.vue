<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDealsStore } from '@/stores/deals.store'
import DealStatusBadge from './DealStatusBadge.vue'
import DealCard from './DealCard.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { computeSmartTags, SMART_TAG_COLORS, SMART_TAG_I18N_KEYS } from '@/utils/smartTags'
import type { SmartTag } from '@/utils/smartTags'
import type { Deal } from '@/types/deals.types'

const { t, locale } = useI18n()
const store = useDealsStore()

interface Column {
  key: keyof Deal
  label: string
  sortable: boolean
}

const columns = computed<Column[]>(() => [
  { key: 'dealName', label: t('deals.columns.dealName'), sortable: true },
  { key: 'accountName', label: t('deals.columns.accountName'), sortable: true },
  { key: 'status', label: t('deals.columns.status'), sortable: true },
  { key: 'amount', label: t('deals.columns.amount'), sortable: true },
  { key: 'createdDate', label: t('deals.columns.createdDate'), sortable: true },
])

function handleSort(col: Column) {
  if (!col.sortable) return
  store.setSort(col.key)
  store.fetchDealsList()
}

function sortIcon(key: keyof Deal): string {
  if (store.sortBy !== key) return '↕'
  return store.sortDir === 'asc' ? '↑' : '↓'
}

function clearAll() {
  store.clearFilters()
  store.setSearch('')
  store.fetchDealsList()
}

function tagLabel(tag: SmartTag): string {
  return t(SMART_TAG_I18N_KEYS[tag])
}

function handleRowClick(dealId: string, event: MouseEvent) {
  ;(event.currentTarget as HTMLElement).focus()
  store.selectDeal(dealId)
}
</script>

<template>
  <LoadingState v-if="store.isLoading" />

  <ErrorState
    v-else-if="store.error"
    :message="store.error.message"
    @retry="store.fetchDealsList()"
  />

  <EmptyState
    v-else-if="store.deals.length === 0"
    :has-filters="store.hasActiveFilters"
    @clear-filters="clearAll"
  />

  <template v-else>
    <!-- Desktop table -->
    <div class="hidden md:block overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table class="min-w-full divide-y divide-gray-200 bg-white text-sm">
        <thead class="bg-gray-50">
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              scope="col"
              :aria-sort="col.sortable && store.sortBy === col.key
                ? (store.sortDir === 'asc' ? 'ascending' : 'descending')
                : (col.sortable ? 'none' : undefined)"
              :class="[
                'px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider',
                col.sortable ? 'cursor-pointer select-none hover:bg-gray-100' : '',
              ]"
              @click="handleSort(col)"
            >
              <span class="flex items-center gap-1">
                {{ col.label }}
                <span v-if="col.sortable" class="text-gray-400 text-xs" aria-hidden="true">{{ sortIcon(col.key) }}</span>
              </span>
            </th>
            <th scope="col" class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {{ t('deals.columns.tags') }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr
            v-for="deal in store.deals"
            :key="deal.dealId"
            :class="[
              'cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-400',
              deal.dealId === store.selectedDealId
                ? 'bg-blue-50 ring-1 ring-inset ring-blue-300'
                : 'hover:bg-blue-50',
            ]"
            tabindex="0"
            @click="handleRowClick(deal.dealId, $event)"
            @keydown.enter="store.selectDeal(deal.dealId)"
          >
            <td class="px-4 py-3 font-medium text-gray-900 max-w-[200px] truncate" :title="deal.dealName">
              <span class="flex items-center gap-2">
                {{ deal.dealName }}
                <span
                  v-if="deal.dealId === store.selectedDealId && store.isLoadingDetail"
                  class="h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600"
                  aria-hidden="true"
                />
              </span>
            </td>
            <td class="px-4 py-3 text-gray-600 max-w-[180px] truncate" :title="deal.accountName">{{ deal.accountName }}</td>
            <td class="px-4 py-3"><DealStatusBadge :status="deal.status" /></td>
            <td class="px-4 py-3 font-medium text-gray-900">{{ formatCurrency(deal.amount, locale) }}</td>
            <td class="px-4 py-3 text-gray-500">{{ formatDate(deal.createdDate, locale) }}</td>
            <td class="px-4 py-3">
              <div class="flex flex-wrap gap-1">
                <AppBadge
                  v-for="tag in computeSmartTags(deal)"
                  :key="tag"
                  variant="custom"
                  :custom-class="SMART_TAG_COLORS[tag]"
                >{{ tagLabel(tag) }}</AppBadge>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile cards -->
    <div class="md:hidden flex flex-col gap-3">
      <DealCard v-for="deal in store.deals" :key="deal.dealId" :deal="deal" />
    </div>
  </template>
</template>
