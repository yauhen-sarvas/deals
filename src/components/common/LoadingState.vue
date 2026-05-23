<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-20 gap-4 text-gray-500">
    <div class="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
    <p class="text-sm">{{ t('common.loading') }}</p>
  </div>
</template>
