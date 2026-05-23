<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useDealsStore } from '@/stores/deals.store'
import { HTTP_CODES } from '@/constants/http'
import DealStatusBadge from '@/components/deals/DealStatusBadge.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import { formatCurrency, formatDate, formatDateRelative } from '@/utils/formatters'
import { computeSmartTags, SMART_TAG_COLORS, SMART_TAG_I18N_KEYS } from '@/utils/smartTags'
import type { SmartTag } from '@/utils/smartTags'
import { ROUTE_NAMES } from '@/router/routes'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useDealsStore()

const dealId = route.params.id as string

onMounted(() => { store.fetchDealDetail(dealId) })

const deal = computed(() => store.currentDeal)
const tags = computed(() => deal.value ? computeSmartTags(deal.value) : [])

const errorType = computed(() => {
  const status = store.detailError?.status
  if (status === HTTP_CODES.NOT_FOUND) return 'notFound'
  if (status === HTTP_CODES.FORBIDDEN) return 'forbidden'
  if (status && status >= HTTP_CODES.INTERNAL_SERVER_ERROR) return 'server'
  if (!status) return 'network'
  return 'generic'
})

function retry() {
  store.fetchDealDetail(dealId)
}

function goBack() {
  router.push({ name: ROUTE_NAMES.DEALS })
}

function tagLabel(tag: SmartTag): string {
  return t(SMART_TAG_I18N_KEYS[tag] as string)
}
</script>

<template>
  <div class="flex flex-col gap-6 max-w-3xl">
      <!-- Back -->
      <div>
        <AppButton variant="ghost" size="sm" @click="goBack">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {{ t('deals.detail.back') }}
        </AppButton>
      </div>

      <LoadingState v-if="store.isLoadingDetail" />

      <ErrorState
        v-else-if="store.detailError"
        :type="errorType"
        @retry="retry"
      />

      <template v-else-if="deal">
        <!-- Header card -->
        <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div class="flex items-start justify-between gap-4">
            <div>
              <h1 class="text-xl font-bold text-gray-900">{{ deal.dealName }}</h1>
              <p class="mt-1 text-gray-500">{{ deal.accountName }}</p>
            </div>
            <DealStatusBadge :status="deal.status" />
          </div>

          <!-- Smart tags -->
          <div v-if="tags.length" class="mt-4 flex flex-wrap gap-2">
            <AppBadge
              v-for="tag in tags"
              :key="tag"
              variant="custom"
              :custom-class="SMART_TAG_COLORS[tag]"
            >{{ tagLabel(tag) }}</AppBadge>
          </div>
        </div>

        <!-- Details grid -->
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p class="text-xs font-semibold uppercase tracking-wider text-gray-400">{{ t('deals.columns.amount') }}</p>
            <p class="mt-1 text-2xl font-bold text-gray-900">{{ formatCurrency(deal.amount, locale) }}</p>
          </div>

          <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p class="text-xs font-semibold uppercase tracking-wider text-gray-400">{{ t('deals.columns.createdDate') }}</p>
            <p class="mt-1 text-lg font-semibold text-gray-900">{{ formatDate(deal.createdDate, locale) }}</p>
            <p class="text-sm text-gray-400">{{ formatDateRelative(deal.createdDate, locale) }}</p>
          </div>

          <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p class="text-xs font-semibold uppercase tracking-wider text-gray-400">{{ t('deals.detail.dealId') }}</p>
            <p class="mt-1 font-mono text-sm text-gray-700">{{ deal.dealId }}</p>
          </div>

          <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p class="text-xs font-semibold uppercase tracking-wider text-gray-400">{{ t('deals.detail.partner') }}</p>
            <p class="mt-1 text-sm font-medium text-gray-700">
              {{ deal.assignedPartnerId ?? t('deals.detail.unassigned') }}
            </p>
          </div>

          <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:col-span-2">
            <p class="text-xs font-semibold uppercase tracking-wider text-gray-400">{{ t('deals.detail.updatedAt') }}</p>
            <p class="mt-1 text-sm text-gray-700">{{ formatDate(deal.updatedAt, locale) }}</p>
          </div>
        </div>
      </template>
  </div>
</template>
