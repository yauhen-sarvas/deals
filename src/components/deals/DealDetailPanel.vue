<script setup lang="ts">
import { computed, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDealsStore } from '@/stores/deals.store'
import { useAuthStore } from '@/stores/auth.store'
import { HTTP_CODES } from '@/constants/http'
import DealStatusBadge from './DealStatusBadge.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import { formatCurrency, formatDate, formatDateRelative } from '@/utils/formatters'
import { computeSmartTags, SMART_TAG_COLORS, SMART_TAG_I18N_KEYS } from '@/utils/smartTags'
import type { SmartTag } from '@/utils/smartTags'

const { t, locale } = useI18n()
const store = useDealsStore()
const authStore = useAuthStore()

const deal = computed(() => store.currentDeal)
const tags = computed(() => deal.value ? computeSmartTags(deal.value) : [])

// Return focus to the element that triggered the panel when it closes
const triggerElement = document.activeElement instanceof HTMLElement ? document.activeElement : null

function close() {
  store.clearSelectedDeal()
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  triggerElement?.focus()
})

watch(() => authStore.currentRole, () => {
  if (store.selectedDealId) store.fetchDealDetail(store.selectedDealId)
})

watch(() => store.detailError, (err) => {
  if (err?.status === HTTP_CODES.FORBIDDEN) close()
})

function retry() {
  if (store.selectedDealId) store.fetchDealDetail(store.selectedDealId)
}

function tagLabel(tag: SmartTag): string {
  return t(SMART_TAG_I18N_KEYS[tag])
}
</script>

<template>
  <div class="flex flex-col h-full rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
    <!-- Panel header -->
    <div class="flex items-center justify-end px-4 py-3 border-b border-gray-200 bg-gray-50 shrink-0">
      <button
        class="rounded p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        :aria-label="t('common.close')"
        @click="close"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Panel body -->
    <div class="flex-1 overflow-y-auto p-4">
      <LoadingState v-if="store.isLoadingDetail" />

      <ErrorState
        v-else-if="store.detailError"
        :message="store.detailError.message"
        @retry="retry"
      />

      <div v-else-if="deal" class="flex flex-col gap-4">
        <!-- Header -->
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <h2 class="text-lg font-bold text-gray-900 truncate">{{ deal.dealName }}</h2>
            <p class="mt-0.5 text-sm text-gray-500 truncate">{{ deal.accountName }}</p>
          </div>
          <DealStatusBadge :status="deal.status" />
        </div>

        <!-- Smart tags -->
        <div v-if="tags.length" class="flex flex-wrap gap-1.5">
          <AppBadge
            v-for="tag in tags"
            :key="tag"
            variant="custom"
            :custom-class="SMART_TAG_COLORS[tag]"
          >{{ tagLabel(tag) }}</AppBadge>
        </div>

        <!-- Details -->
        <div class="grid grid-cols-2 gap-3">
          <div class="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <p class="text-xs font-semibold uppercase tracking-wider text-gray-400">{{ t('deals.columns.amount') }}</p>
            <p class="mt-1 text-xl font-bold text-gray-900">{{ formatCurrency(deal.amount, locale) }}</p>
          </div>

          <div class="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <p class="text-xs font-semibold uppercase tracking-wider text-gray-400">{{ t('deals.columns.createdDate') }}</p>
            <p class="mt-1 text-sm font-semibold text-gray-900">{{ formatDate(deal.createdDate, locale) }}</p>
            <p class="text-xs text-gray-400">{{ formatDateRelative(deal.createdDate, locale) }}</p>
          </div>

          <div class="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <p class="text-xs font-semibold uppercase tracking-wider text-gray-400">{{ t('deals.detail.dealId') }}</p>
            <p class="mt-1 font-mono text-xs text-gray-700 break-all">{{ deal.dealId }}</p>
          </div>

          <div class="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <p class="text-xs font-semibold uppercase tracking-wider text-gray-400">{{ t('deals.detail.partner') }}</p>
            <p class="mt-1 text-sm font-medium text-gray-700">
              {{ deal.assignedPartnerId ?? t('deals.detail.unassigned') }}
            </p>
          </div>

          <div class="col-span-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
            <p class="text-xs font-semibold uppercase tracking-wider text-gray-400">{{ t('deals.detail.updatedAt') }}</p>
            <p class="mt-1 text-sm text-gray-700">{{ formatDate(deal.updatedAt, locale) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
