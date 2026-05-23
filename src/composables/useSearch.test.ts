import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSetSearch = vi.fn()
const mockFetchDealsList = vi.fn()

vi.mock('@/stores/deals.store', () => ({
  useDealsStore: () => ({
    search: '',
    setSearch: mockSetSearch,
    fetchDealsList: mockFetchDealsList,
  }),
}))

vi.mock('@/constants/api', () => ({
  SEARCH_DEBOUNCE_MS: 0,
}))

import { useSearch } from './useSearch'

describe('useSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exposes localQuery initialised from store.search', () => {
    const { localQuery } = useSearch()
    expect(localQuery.value).toBe('')
  })

  it('clearSearch resets localQuery to empty string', () => {
    const { localQuery, clearSearch } = useSearch()
    localQuery.value = 'hello'
    clearSearch()
    expect(localQuery.value).toBe('')
  })

  it('clearSearch calls store.setSearch with empty string', () => {
    const { clearSearch } = useSearch()
    clearSearch()
    expect(mockSetSearch).toHaveBeenCalledWith('')
  })

  it('clearSearch calls store.fetchDealsList', () => {
    const { clearSearch } = useSearch()
    clearSearch()
    expect(mockFetchDealsList).toHaveBeenCalled()
  })
})
