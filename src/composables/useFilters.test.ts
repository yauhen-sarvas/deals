import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockStore = {
  filters: {
    status: [],
    amountMin: null,
    amountMax: null,
    dateFrom: null,
    dateTo: null,
    accountName: '',
    dealName: '',
  },
  applyFilters: vi.fn(),
  clearFilters: vi.fn(),
  fetchDealsList: vi.fn(),
}

const mockUiStore = {
  closeFilters: vi.fn(),
}

vi.mock('@/stores/deals.store', () => ({
  useDealsStore: () => mockStore,
  defaultFilters: () => ({
    status: [],
    amountMin: null,
    amountMax: null,
    dateFrom: null,
    dateTo: null,
    accountName: '',
    dealName: '',
  }),
}))

vi.mock('@/stores/ui.store', () => ({
  useUiStore: () => mockUiStore,
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}))

import { useFilters } from './useFilters'

describe('useFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initialises localFilters from store.filters', () => {
    const { localFilters } = useFilters()
    expect(localFilters.value.status).toEqual([])
    expect(localFilters.value.amountMin).toBeNull()
  })

  it('toggleStatus adds a status that is not yet selected', () => {
    const { localFilters, toggleStatus } = useFilters()
    toggleStatus('Open')
    expect(localFilters.value.status).toContain('Open')
  })

  it('toggleStatus removes a status that is already selected', () => {
    const { localFilters, toggleStatus } = useFilters()
    toggleStatus('Open')
    toggleStatus('Open')
    expect(localFilters.value.status).not.toContain('Open')
  })

  it('toggleStatus handles multiple statuses independently', () => {
    const { localFilters, toggleStatus } = useFilters()
    toggleStatus('Open')
    toggleStatus('Approved')
    expect(localFilters.value.status).toContain('Open')
    expect(localFilters.value.status).toContain('Approved')
  })

  it('amountError is null when min < max', () => {
    const { localFilters, amountError } = useFilters()
    localFilters.value.amountMin = 100
    localFilters.value.amountMax = 200
    expect(amountError.value).toBeNull()
  })

  it('amountError is null when both are null', () => {
    const { amountError } = useFilters()
    expect(amountError.value).toBeNull()
  })

  it('amountError returns i18n key when min > max', () => {
    const { localFilters, amountError } = useFilters()
    localFilters.value.amountMin = 500
    localFilters.value.amountMax = 100
    expect(amountError.value).toBe('deals.filters.amountError')
  })

  it('applyFilters does not call store when amountError is set', () => {
    const { localFilters, applyFilters } = useFilters()
    localFilters.value.amountMin = 500
    localFilters.value.amountMax = 100
    applyFilters()
    expect(mockStore.applyFilters).not.toHaveBeenCalled()
  })

  it('applyFilters calls store.applyFilters and fetchDealsList when valid', () => {
    const { applyFilters } = useFilters()
    applyFilters()
    expect(mockStore.applyFilters).toHaveBeenCalled()
    expect(mockStore.fetchDealsList).toHaveBeenCalled()
  })

  it('clearFilters resets localFilters to defaults', () => {
    const { localFilters, toggleStatus, clearFilters } = useFilters()
    toggleStatus('Open')
    clearFilters()
    expect(localFilters.value.status).toEqual([])
  })

  it('clearFilters calls store.clearFilters and fetchDealsList', () => {
    const { clearFilters } = useFilters()
    clearFilters()
    expect(mockStore.clearFilters).toHaveBeenCalled()
    expect(mockStore.fetchDealsList).toHaveBeenCalled()
  })
})
