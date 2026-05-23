<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth.store'
import { ROUTE_NAMES } from '@/router/routes'
import LanguageSwitcher from './LanguageSwitcher.vue'
import RoleSwitcher from './RoleSwitcher.vue'

const { t } = useI18n()
const auth = useAuthStore()
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm">
    <div class="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4">
      <!-- Logo -->
      <div class="flex items-center gap-3">
        <div class="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-white font-bold text-sm">
          AP
        </div>
        <span class="font-semibold text-gray-900 hidden sm:block">Partner Portal</span>
      </div>

      <!-- Nav -->
      <nav class="flex items-center gap-1">
        <RouterLink
          :to="{ name: ROUTE_NAMES.DEALS }"
          class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
          :class="$route.name === ROUTE_NAMES.DEALS || $route.name === ROUTE_NAMES.DEAL_DETAIL
            ? 'bg-blue-50 text-blue-700'
            : 'text-gray-600 hover:bg-gray-100'"
        >
          {{ t('nav.deals') }}
        </RouterLink>
        <RouterLink
          v-if="auth.isAdmin"
          :to="{ name: ROUTE_NAMES.ADMIN }"
          class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
          :class="$route.name === ROUTE_NAMES.ADMIN
            ? 'bg-blue-50 text-blue-700'
            : 'text-gray-600 hover:bg-gray-100'"
        >
          {{ t('nav.admin') }}
        </RouterLink>
      </nav>

      <!-- Right side -->
      <div class="flex items-center gap-3">
        <LanguageSwitcher />
        <RoleSwitcher />
      </div>
    </div>
  </header>
</template>
