<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { STORAGE_KEYS } from '@/constants/storage'

const { locale } = useI18n()

const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'de', label: 'DE' },
  { code: 'ja', label: 'JA' },
  { code: 'es', label: 'ES' },
  { code: 'zh', label: 'ZH' },
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
      :aria-pressed="locale === lang.code"
      :class="[
        'rounded px-2.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1',
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
