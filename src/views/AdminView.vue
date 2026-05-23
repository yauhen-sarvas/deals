<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <div class="flex flex-col gap-6 max-w-3xl">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">{{ t('admin.title') }}</h1>
      <p class="mt-1 text-sm text-gray-500">{{ t('admin.subtitle') }}</p>
    </div>

    <div class="rounded-lg border border-blue-200 bg-blue-50 p-6">
      <div class="flex items-start gap-4">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <div>
          <p class="font-semibold text-blue-900">{{ t('admin.info.title') }}</p>
          <p class="mt-1 text-sm text-blue-800">{{ t('admin.info.body') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
