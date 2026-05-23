import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { MockUser, Role } from '@/types/deals.types'
import { STORAGE_KEYS } from '@/constants/storage'

export const MOCK_USERS: Record<string, MockUser> = {
  admin: { id: 'user-admin', role: 'Admin', name: 'Alice Admin' },
  partner: { id: 'user-partner-1', role: 'Partner', name: 'Bob Partner' },
}

export const useAuthStore = defineStore('auth', () => {
  const savedKey = sessionStorage.getItem(STORAGE_KEYS.AUTH_USER) ?? 'admin'
  const currentUser = ref<MockUser | null>(MOCK_USERS[savedKey] ?? MOCK_USERS.admin)

  const isAdmin = computed(() => currentUser.value?.role === 'Admin')
  const isPartner = computed(() => currentUser.value?.role === 'Partner')
  const currentRole = computed<Role | null>(() => currentUser.value?.role ?? null)

  function switchUser(key: 'admin' | 'partner') {
    currentUser.value = MOCK_USERS[key]
    sessionStorage.setItem(STORAGE_KEYS.AUTH_USER, key)
  }

  function logout() {
    currentUser.value = null
    sessionStorage.removeItem(STORAGE_KEYS.AUTH_USER)
  }

  function $reset() {
    currentUser.value = MOCK_USERS.admin
    sessionStorage.removeItem(STORAGE_KEYS.AUTH_USER)
  }

  return { currentUser, isAdmin, isPartner, currentRole, switchUser, logout, $reset }
})
