<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore, MOCK_USERS } from '@/stores/auth.store'
import { useDealsStore } from '@/stores/deals.store'
import { ROUTE_NAMES } from '@/router/routes'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const dealsStore = useDealsStore()
const menuOpen = ref(false)

const currentUserName = computed(() => authStore.currentUser?.name ?? '')

function switchRole(key: 'admin' | 'partner') {
  authStore.switchUser(key)
  dealsStore.clearFilters()
  dealsStore.invalidateCache()
  dealsStore.fetchDealsList()
  menuOpen.value = false

  if (route.meta.requiresAdmin && !authStore.isAdmin) {
    router.push({ name: ROUTE_NAMES.DEALS })
  }
}
</script>

<template>
  <div class="relative">
    <button
      class="flex items-center gap-2 rounded-md border border-gray-300 px-3 py-1.5 text-sm
             hover:bg-gray-50 transition-colors"
      @click="menuOpen = !menuOpen"
    >
      <span class="text-xs text-gray-500">{{ t('auth.role') }}:</span>
      <span class="font-medium text-gray-800">{{ authStore.currentRole }}</span>
      <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <div
      v-if="menuOpen"
      class="absolute right-0 mt-1 w-48 rounded-md border border-gray-200 bg-white shadow-lg py-1 z-50"
    >
      <div class="px-3 py-2 text-xs text-gray-400 border-b border-gray-100">
        {{ t('auth.currentUser', { name: currentUserName }) }}
      </div>
      <button
        class="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
        :class="authStore.currentRole === 'Admin' ? 'font-semibold text-blue-600' : 'text-gray-700'"
        @click="switchRole('admin')"
      >
        {{ t('auth.admin') }} — {{ MOCK_USERS.admin.name }}
      </button>
      <button
        class="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
        :class="authStore.currentRole === 'Partner' ? 'font-semibold text-blue-600' : 'text-gray-700'"
        @click="switchRole('partner')"
      >
        {{ t('auth.partner') }} — {{ MOCK_USERS.partner.name }}
      </button>
    </div>
  </div>

  <div v-if="menuOpen" class="fixed inset-0 z-40" @click="menuOpen = false" />
</template>
