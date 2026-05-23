import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/services/deals.service', () => ({
  fetchDeals: vi.fn(),
  fetchDealById: vi.fn(),
  invalidateDealsCache: vi.fn(),
}))

vi.mock('@/utils/deduplication', () => ({
  deduplicateDeals: (deals: unknown[]) => deals,
}))

vi.mock('@/i18n', () => ({
  i18n: { global: { t: (key: string) => key } },
}))

import { useDealsStore, defaultFilters } from './deals.store'
import { fetchDeals, fetchDealById } from '@/services/deals.service'
import type { Deal, DealsApiResponse } from '@/types/deals.types'

function makeDeal(partial: Partial<Deal> = {}): Deal {
  return {
    dealId: 'deal-001',
    dealName: 'Test',
    accountName: 'Corp',
    status: 'Open',
    amount: 1000,
    createdDate: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-06-01T00:00:00.000Z',
    ...partial,
  }
}

function makeResponse(deals: Deal[], total = deals.length): DealsApiResponse {
  return { data: deals, pagination: { page: 1, pageSize: 20, total } }
}

describe('useDealsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('fetchDealsList', () => {
    it('sets deals on success', async () => {
      const deal = makeDeal()
      vi.mocked(fetchDeals).mockResolvedValue(makeResponse([deal]))
      const store = useDealsStore()
      await store.fetchDealsList()
      expect(store.deals).toHaveLength(1)
      expect(store.deals[0].dealId).toBe('deal-001')
    })

    it('sets isLoading to false after success', async () => {
      vi.mocked(fetchDeals).mockResolvedValue(makeResponse([]))
      const store = useDealsStore()
      await store.fetchDealsList()
      expect(store.isLoading).toBe(false)
    })

    it('sets error and clears deals on failure', async () => {
      vi.mocked(fetchDeals).mockRejectedValue(new Error('Network'))
      const store = useDealsStore()
      await store.fetchDealsList()
      expect(store.error).not.toBeNull()
      expect(store.isLoading).toBe(false)
    })

    it('clears previous error on new fetch', async () => {
      vi.mocked(fetchDeals).mockRejectedValueOnce(new Error('fail'))
      const store = useDealsStore()
      await store.fetchDealsList()
      expect(store.error).not.toBeNull()

      vi.mocked(fetchDeals).mockResolvedValue(makeResponse([]))
      await store.fetchDealsList()
      expect(store.error).toBeNull()
    })

    it('updates pagination.total from response', async () => {
      vi.mocked(fetchDeals).mockResolvedValue(makeResponse([makeDeal()], 42))
      const store = useDealsStore()
      await store.fetchDealsList()
      expect(store.pagination.total).toBe(42)
    })
  })

  describe('fetchDealDetail', () => {
    it('sets currentDeal on success', async () => {
      const deal = makeDeal()
      vi.mocked(fetchDealById).mockResolvedValue(deal)
      const store = useDealsStore()
      await store.fetchDealDetail('deal-001')
      expect(store.currentDeal?.dealId).toBe('deal-001')
    })

    it('sets detailError and clears currentDeal on failure', async () => {
      vi.mocked(fetchDealById).mockRejectedValue(new Error('Not found'))
      const store = useDealsStore()
      await store.fetchDealDetail('bad-id')
      expect(store.detailError).not.toBeNull()
      expect(store.currentDeal).toBeNull()
    })
  })

  describe('mergeDeals', () => {
    it('merges incoming deals with existing ones', async () => {
      vi.mocked(fetchDeals).mockResolvedValue(makeResponse([makeDeal({ dealId: 'a' })]))
      const store = useDealsStore()
      await store.fetchDealsList()
      store.mergeDeals([makeDeal({ dealId: 'b' })])
      expect(store.deals).toHaveLength(2)
    })
  })

  describe('clearFilters', () => {
    it('resets filters to defaults and page to 1', () => {
      const store = useDealsStore()
      store.applyFilters({ status: ['Open'], amountMin: 100 })
      store.setPage(3)
      store.clearFilters()
      expect(store.filters).toEqual(defaultFilters())
      expect(store.pagination.page).toBe(1)
    })
  })

  describe('setSort', () => {
    it('toggles sort direction when same column clicked twice', () => {
      const store = useDealsStore()
      store.setSort('amount')
      expect(store.sortDir).toBe('asc')
      store.setSort('amount')
      expect(store.sortDir).toBe('desc')
    })

    it('resets to asc when a new column is selected', () => {
      const store = useDealsStore()
      store.setSort('amount')
      store.setSort('amount')
      store.setSort('dealName')
      expect(store.sortDir).toBe('asc')
      expect(store.sortBy).toBe('dealName')
    })
  })

  describe('$reset', () => {
    it('returns store to initial state', async () => {
      vi.mocked(fetchDeals).mockResolvedValue(makeResponse([makeDeal()]))
      const store = useDealsStore()
      await store.fetchDealsList()
      store.setPage(5)
      store.$reset()
      expect(store.deals).toHaveLength(0)
      expect(store.pagination.page).toBe(1)
      expect(store.error).toBeNull()
    })
  })
})
