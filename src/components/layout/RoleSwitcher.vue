<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore, MOCK_USERS } from '@/stores/auth.store'
import { useAuth } from '@/composables/useAuth'
import { ROUTE_NAMES } from '@/router/routes'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { switchToAdmin, switchToPartner } = useAuth()
const menuOpen = ref(false)
const triggerRef = ref<HTMLButtonElement | null>(null)

const currentUserName = computed(() => authStore.currentUser?.name ?? '')

function open() {
  menuOpen.value = true
}

function close() {
  menuOpen.value = false
  triggerRef.value?.focus()
}

function toggle() {
  menuOpen.value ? close() : open()
}

function switchRole(key: 'admin' | 'partner') {
  if (key === 'admin') switchToAdmin()
  else switchToPartner()
  close()

  if (route.meta.requiresAdmin && !authStore.isAdmin) {
    router.push({ name: ROUTE_NAMES.DEALS })
  }
}
</script>

<template>
  <div class="relative">
    <button
      ref="triggerRef"
      :aria-expanded="menuOpen"
      aria-haspopup="menu"
      class="flex items-center gap-2 rounded-md border border-gray-300 px-3 py-1.5 text-sm
             hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      @click="toggle"
      @keydown.escape="close"
    >
      <span class="text-xs text-gray-500">{{ t('auth.role') }}:</span>
      <span class="font-medium text-gray-800">{{ authStore.currentRole }}</span>
      <svg
        class="h-4 w-4 text-gray-400 transition-transform duration-200"
        :class="menuOpen ? 'rotate-180' : ''"
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <transition
      enter-active-class="transition-all duration-150 ease-out"
      enter-from-class="opacity-0 scale-95 -translate-y-1"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition-all duration-100 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 -translate-y-1"
    >
      <div
        v-if="menuOpen"
        role="menu"
        class="absolute right-0 mt-1 w-48 rounded-md border border-gray-200 bg-white shadow-lg py-1 z-50 origin-top-right"
        @keydown.escape="close"
      >
        <div class="px-3 py-2 text-xs text-gray-400 border-b border-gray-100">
          {{ t('auth.currentUser', { name: currentUserName }) }}
        </div>
        <button
          role="menuitem"
          class="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-400"
          :class="authStore.currentRole === 'Admin' ? 'font-semibold text-blue-600' : 'text-gray-700'"
          @click="switchRole('admin')"
        >
          {{ t('auth.admin') }} — {{ MOCK_USERS.admin.name }}
        </button>
        <button
          role="menuitem"
          class="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-400"
          :class="authStore.currentRole === 'Partner' ? 'font-semibold text-blue-600' : 'text-gray-700'"
          @click="switchRole('partner')"
        >
          {{ t('auth.partner') }} — {{ MOCK_USERS.partner.name }}
        </button>
      </div>
    </transition>
  </div>

  <div v-if="menuOpen" class="fixed inset-0 z-40" aria-hidden="true" @click="close" />
</template>
