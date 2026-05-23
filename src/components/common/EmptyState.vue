<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import AppButton from '@/components/ui/AppButton.vue'

defineProps<{
  hasFilters?: boolean
}>()

const emit = defineEmits<{ clearFilters: [] }>()
const { t } = useI18n()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-20 gap-4 text-gray-500">
    <div class="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
      <svg class="h-7 w-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <div class="text-center">
      <p class="font-medium text-gray-800">{{ t('deals.empty.title') }}</p>
      <p class="mt-1 text-sm text-gray-500">
        {{ hasFilters ? t('deals.empty.description') : t('deals.empty.noFilters') }}
      </p>
    </div>
    <AppButton v-if="hasFilters" variant="secondary" size="sm" @click="emit('clearFilters')">
      {{ t('common.clearFilters') }}
    </AppButton>
  </div>
</template>
