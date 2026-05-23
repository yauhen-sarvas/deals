<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { STORAGE_KEYS } from '@/constants/storage'

const { locale } = useI18n()

const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'de', label: 'DE' },
  { code: 'ja', label: 'JA' },
  { code: 'es', label: 'ES' },
]

function setLocale(code: string) {
  locale.value = code
  localStorage.setItem(STORAGE_KEYS.LOCALE, code)
}
</script>

<template>
  <div class="flex items-center gap-1">
    <button
      v-for="lang in LANGUAGES"
      :key="lang.code"
      :class="[
        'rounded px-2 py-1 text-xs font-medium transition-colors',
        locale === lang.code
          ? 'bg-blue-600 text-white'
          : 'text-gray-600 hover:bg-gray-100',
      ]"
      @click="setLocale(lang.code)"
    >
      {{ lang.label }}
    </button>
  </div>
</template>
