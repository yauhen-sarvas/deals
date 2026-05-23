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

import { usePagination } from './usePagination'
import { useDealsStore } from '@/stores/deals.store'

function setup(page: number, total: number, pageSize = 20) {
  setActivePinia(createPinia())
  const store = useDealsStore()
  store.pagination.page = page
  store.pagination.total = total
  store.pagination.pageSize = pageSize
  return { store, ...usePagination() }
}

describe('usePagination', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('totalPages', () => {
    it('returns 1 when total is 0', () => {
      const { totalPages } = setup(1, 0)
      expect(totalPages.value).toBe(1)
    })

    it('returns 1 when total equals pageSize', () => {
      const { totalPages } = setup(1, 20)
      expect(totalPages.value).toBe(1)
    })

    it('returns 2 when total is pageSize + 1', () => {
      const { totalPages } = setup(1, 21)
      expect(totalPages.value).toBe(2)
    })

    it('rounds up correctly', () => {
      const { totalPages } = setup(1, 45, 20)
      expect(totalPages.value).toBe(3)
    })
  })

  describe('hasPrev / hasNext', () => {
    it('hasPrev is false on page 1', () => {
      const { hasPrev } = setup(1, 100)
      expect(hasPrev.value).toBe(false)
    })

    it('hasPrev is true on page 2', () => {
      const { hasPrev } = setup(2, 100)
      expect(hasPrev.value).toBe(true)
    })

    it('hasNext is false on the last page', () => {
      const { hasNext, totalPages } = setup(5, 100)
      expect(totalPages.value).toBe(5)
      expect(hasNext.value).toBe(false)
    })

    it('hasNext is true when not on the last page', () => {
      const { hasNext } = setup(1, 100)
      expect(hasNext.value).toBe(true)
    })
  })

  describe('pageNumbers algorithm', () => {
    it('returns [1] for a single page', () => {
      const { pageNumbers } = setup(1, 20)
      expect(pageNumbers.value).toEqual([1])
    })

    it('returns all pages when total pages ≤ 5', () => {
      // page 3, totalPages 5: range [1..5], no gap at either end
      const { pageNumbers } = setup(3, 100, 20)
      expect(pageNumbers.value).toEqual([1, 2, 3, 4, 5])
    })

    it('adds trailing ellipsis and last page when far from end (page 1 of 10)', () => {
      const { pageNumbers } = setup(1, 200, 20)
      expect(pageNumbers.value).toEqual([1, 2, 3, -1, 10])
    })

    it('adds leading ellipsis and first page when far from start (page 10 of 10)', () => {
      const { pageNumbers } = setup(10, 200, 20)
      expect(pageNumbers.value).toEqual([1, -1, 8, 9, 10])
    })

    it('adds both ellipses for a middle page (page 5 of 10)', () => {
      const { pageNumbers } = setup(5, 200, 20)
      expect(pageNumbers.value).toEqual([1, -1, 3, 4, 5, 6, 7, -1, 10])
    })

    it('omits trailing ellipsis when range is adjacent to last page', () => {
      // page 1, totalPages 4: range [1..3], rangeEnd=3 === total-1=3 → no ellipsis
      const { pageNumbers } = setup(1, 80, 20)
      expect(pageNumbers.value).toEqual([1, 2, 3, 4])
    })

    it('omits leading ellipsis when range starts at page 2 (adjacent to first)', () => {
      // page 4, totalPages 10: rangeStart=2, 2 > 2 is false → no leading ellipsis
      // Result: [1, 2, 3, 4, 5, 6, -1, 10]
      const { pageNumbers } = setup(4, 200, 20)
      const pages = pageNumbers.value
      expect(pages[0]).toBe(1)
      // Second element must be page 2, not an ellipsis
      expect(pages[1]).toBe(2)
    })
  })

  describe('navigation', () => {
    it('goToPage updates store.pagination.page', () => {
      const { store, goToPage } = setup(1, 100)
      goToPage(3)
      expect(store.pagination.page).toBe(3)
    })

    it('goToPage triggers a fetch', () => {
      const { goToPage } = setup(1, 100)
      goToPage(2)
      expect(mockFetchDeals).toHaveBeenCalled()
    })

    it('prevPage decrements page when hasPrev', () => {
      const { store, prevPage } = setup(3, 100)
      prevPage()
      expect(store.pagination.page).toBe(2)
    })

    it('prevPage does nothing on page 1', () => {
      const { store, prevPage } = setup(1, 100)
      prevPage()
      expect(store.pagination.page).toBe(1)
    })

    it('nextPage increments page when hasNext', () => {
      const { store, nextPage } = setup(1, 100)
      nextPage()
      expect(store.pagination.page).toBe(2)
    })

    it('nextPage does nothing on the last page', () => {
      const { store, nextPage } = setup(5, 100)
      nextPage()
      expect(store.pagination.page).toBe(5)
    })
  })
})
