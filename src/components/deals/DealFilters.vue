<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useFilters } from '@/composables/useFilters'
import AppButton from '@/components/ui/AppButton.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppCheckbox from '@/components/ui/AppCheckbox.vue'
import type { DealStatus } from '@/types/deals.types'
import { useDealsStore } from '@/stores/deals.store'

const { t } = useI18n()
const store = useDealsStore()
const { localFilters, amountError, dateError, toggleStatus, applyFilters, clearFilters } = useFilters()

const STATUSES: DealStatus[] = ['Open', 'Approved', 'Rejected']
</script>

<template>
  <!-- Each direct child becomes a grid cell in the parent grid -->

  <!-- Status -->
  <div class="flex flex-col gap-2">
    <p class="text-sm font-semibold text-gray-700">{{ t('deals.filters.status') }}</p>
    <div class="flex flex-col gap-1.5">
      <AppCheckbox
        v-for="status in STATUSES"
        :key="status"
        :id="`filter-status-${status}`"
        :model-value="localFilters.status.includes(status)"
        :label="t(`deals.status.${status}`)"
        @update:model-value="toggleStatus(status)"
      />
    </div>
  </div>

  <!-- Amount range -->
  <div class="flex flex-col gap-2">
    <p class="text-sm font-semibold text-gray-700">{{ t('deals.filters.amountRange') }}</p>
    <AppInput
      v-model="localFilters.amountMin"
      type="number"
      :placeholder="t('deals.filters.amountMin')"
      :error="amountError ?? undefined"
    />
    <AppInput
      v-model="localFilters.amountMax"
      type="number"
      :placeholder="t('deals.filters.amountMax')"
      :error="amountError ?? undefined"
      :hide-error-text="true"
    />
  </div>

  <!-- Date range -->
  <div class="flex flex-col gap-2">
    <p class="text-sm font-semibold text-gray-700">{{ t('deals.filters.dateRange') }}</p>
    <AppInput
      v-model="localFilters.dateFrom"
      type="date"
      :placeholder="t('deals.filters.dateFrom')"
      id="filter-date-from"
      :error="dateError ?? undefined"
      :hide-error-text="true"
    />
    <AppInput
      v-model="localFilters.dateTo"
      type="date"
      :placeholder="t('deals.filters.dateTo')"
      id="filter-date-to"
      :error="dateError ?? undefined"
    />
  </div>

  <!-- Account name -->
  <div class="flex flex-col gap-2">
    <p class="text-sm font-semibold text-gray-700">{{ t('deals.filters.accountName') }}</p>
    <AppInput
      v-model="localFilters.accountName"
      type="text"
      :placeholder="t('deals.filters.accountName')"
    />
  </div>

  <!-- Deal name -->
  <div class="flex flex-col gap-2">
    <p class="text-sm font-semibold text-gray-700">{{ t('deals.filters.dealName') }}</p>
    <AppInput
      v-model="localFilters.dealName"
      type="text"
      :placeholder="t('deals.filters.dealName')"
    />
  </div>

  <!-- Actions — spans all columns -->
  <div class="flex gap-2 sm:col-span-2 md:col-span-3 lg:col-span-5 pt-2 border-t border-gray-200">
    <AppButton
      variant="primary"
      :disabled="!!amountError || !!dateError"
      :loading="store.isLoading"
      @click="applyFilters"
    >
      {{ t('deals.filters.apply') }}
    </AppButton>
    <AppButton variant="ghost" @click="clearFilters">
      {{ t('deals.filters.clear') }}
    </AppButton>
  </div>
</template>
