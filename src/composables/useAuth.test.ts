import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

const { mockFetchDeals } = vi.hoisted(() => ({
  mockFetchDeals: vi.fn().mockResolvedValue({ data: [], pagination: { page: 1, pageSize: 20, total: 0 } }),
}))

vi.mock('@/services/deals.service', () => ({
  fetchDeals: mockFetchDeals,
  fetchDealById: vi.fn(),
  invalidateDealsCache: vi.fn(),
}))

vi.mock('@/utils/deduplication', () => ({
  deduplicateDeals: (deals: unknown[]) => deals,
}))

vi.mock('@/i18n', () => ({
  i18n: { global: { t: (key: string) => key } },
}))

import { useAuth } from './useAuth'
import { useAuthStore } from '@/stores/auth.store'
import { useDealsStore } from '@/stores/deals.store'

describe('useAuth', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    sessionStorage.clear()
    vi.clearAllMocks()
  })

  it('exposes currentUser from auth store', () => {
    const { currentUser } = useAuth()
    expect(currentUser?.role).toBe('Admin')
  })

  it('exposes isAdmin computed from auth store', () => {
    const { isAdmin } = useAuth()
    expect(isAdmin).toBe(true)
  })

  it('exposes isPartner computed from auth store', () => {
    const { isPartner } = useAuth()
    expect(isPartner).toBe(false)
  })

  it('exposes currentRole from auth store', () => {
    const { currentRole } = useAuth()
    expect(currentRole).toBe('Admin')
  })

  describe('switchToAdmin', () => {
    it('switches auth store to admin user', () => {
      const authStore = useAuthStore()
      authStore.switchUser('partner')
      const { switchToAdmin } = useAuth()
      switchToAdmin()
      expect(authStore.currentUser?.role).toBe('Admin')
    })

    it('clears deals store filters', () => {
      const dealsStore = useDealsStore()
      dealsStore.applyFilters({ status: ['Open'] })
      const { switchToAdmin } = useAuth()
      switchToAdmin()
      expect(dealsStore.filters.status).toEqual([])
    })

    it('triggers a deals fetch', () => {
      const { switchToAdmin } = useAuth()
      switchToAdmin()
      expect(mockFetchDeals).toHaveBeenCalled()
    })
  })

  describe('switchToPartner', () => {
    it('switches auth store to partner user', () => {
      const authStore = useAuthStore()
      const { switchToPartner } = useAuth()
      switchToPartner()
      expect(authStore.currentUser?.role).toBe('Partner')
    })

    it('clears deals store filters', () => {
      const dealsStore = useDealsStore()
      dealsStore.applyFilters({ status: ['Approved'] })
      const { switchToPartner } = useAuth()
      switchToPartner()
      expect(dealsStore.filters.status).toEqual([])
    })

    it('triggers a deals fetch', () => {
      const { switchToPartner } = useAuth()
      switchToPartner()
      expect(mockFetchDeals).toHaveBeenCalled()
    })
  })
})
