<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDealsStore } from '@/stores/deals.store'
import LoadingState from '@/components/common/LoadingState.vue'

const { t } = useI18n()
const store = useDealsStore()

const totalDeals = computed(() => store.pagination.total)
const openDeals = computed(() => store.deals.filter(d => d.status === 'Open').length)
const approvedDeals = computed(() => store.deals.filter(d => d.status === 'Approved').length)
const rejectedDeals = computed(() => store.deals.filter(d => d.status === 'Rejected').length)
</script>

<template>
  <div class="flex flex-col gap-6 max-w-3xl">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">{{ t('admin.title') }}</h1>
      <p class="mt-1 text-sm text-gray-500">{{ t('admin.subtitle') }}</p>
    </div>

    <!-- Restricted notice -->
    <div class="rounded-lg border border-blue-200 bg-blue-50 p-4">
      <div class="flex items-start gap-3">
        <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <div>
          <p class="font-semibold text-blue-900">{{ t('admin.info.title') }}</p>
          <p class="mt-0.5 text-sm text-blue-800">{{ t('admin.info.body') }}</p>
        </div>
      </div>
    </div>

    <!-- Stats grid -->
    <LoadingState v-if="store.isLoading" />
    <div v-else class="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-wider text-gray-400">{{ t('admin.stats.total') }}</p>
        <p class="mt-1 text-2xl font-bold text-gray-900">{{ totalDeals }}</p>
      </div>
      <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-wider text-gray-400">{{ t('deals.status.Open') }}</p>
        <p class="mt-1 text-2xl font-bold text-blue-600">{{ openDeals }}</p>
      </div>
      <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-wider text-gray-400">{{ t('deals.status.Approved') }}</p>
        <p class="mt-1 text-2xl font-bold text-green-600">{{ approvedDeals }}</p>
      </div>
      <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-wider text-gray-400">{{ t('deals.status.Rejected') }}</p>
        <p class="mt-1 text-2xl font-bold text-red-600">{{ rejectedDeals }}</p>
      </div>
    </div>
  </div>
</template>
