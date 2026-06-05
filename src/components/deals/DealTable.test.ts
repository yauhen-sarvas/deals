import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import type { Deal } from '@/types/deals.types'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key, locale: { value: 'en' } }),
}))

const storeState = {
  isLoading: false,
  error: null as { message: string } | null,
  deals: [] as Deal[],
  hasActiveFilters: false,
  selectedDealId: null as string | null,
  isLoadingDetail: false,
  sortBy: '',
  sortDir: 'asc' as 'asc' | 'desc',
  setSort: vi.fn(),
  fetchDealsList: vi.fn(),
  selectDeal: vi.fn(),
  clearFilters: vi.fn(),
  setSearch: vi.fn(),
}

vi.mock('@/stores/deals.store', () => ({
  useDealsStore: () => storeState,
}))

vi.mock('@/utils/smartTags', () => ({
  computeSmartTags: vi.fn(() => []),
  SMART_TAG_COLORS: {},
  SMART_TAG_I18N_KEYS: {},
}))

vi.mock('@/utils/formatters', () => ({
  formatCurrency: (amount: number) => `$${amount}`,
  formatDate: (date: string) => date,
}))

import DealTable from './DealTable.vue'

function makeDeal(partial: Partial<Deal> = {}): Deal {
  return {
    dealId: 'd1', dealName: 'Test Deal', accountName: 'Corp',
    status: 'Open', amount: 1000,
    createdDate: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-06-01T00:00:00.000Z',
    ...partial,
  }
}

describe('DealTable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    storeState.isLoading = false
    storeState.error = null
    storeState.deals = []
    storeState.hasActiveFilters = false
    storeState.selectedDealId = null
    storeState.sortBy = ''
    storeState.sortDir = 'asc'
  })

  it('shows LoadingState when isLoading is true', () => {
    storeState.isLoading = true
    const wrapper = mount(DealTable)
    expect(wrapper.find('.animate-spin').exists()).toBe(true)
  })

  it('shows ErrorState when error is set', () => {
    storeState.error = { message: 'Network error' }
    const wrapper = mount(DealTable)
    expect(wrapper.text()).toContain('Network error')
  })

  it('shows EmptyState when deals is empty and not loading', () => {
    const wrapper = mount(DealTable)
    expect(wrapper.text()).toContain('deals.empty.title')
  })

  it('renders the deals table when deals are present', () => {
    storeState.deals = [makeDeal()]
    const wrapper = mount(DealTable)
    expect(wrapper.find('table').exists()).toBe(true)
  })

  it('renders a row for each deal', () => {
    storeState.deals = [makeDeal({ dealId: 'd1' }), makeDeal({ dealId: 'd2' })]
    const wrapper = mount(DealTable)
    expect(wrapper.findAll('tbody tr')).toHaveLength(2)
  })

  it('renders deal name in row', () => {
    storeState.deals = [makeDeal({ dealName: 'Mega Deal' })]
    const wrapper = mount(DealTable)
    expect(wrapper.text()).toContain('Mega Deal')
  })

  it('calls selectDeal when a row is clicked', async () => {
    storeState.deals = [makeDeal({ dealId: 'abc' })]
    const wrapper = mount(DealTable)
    await wrapper.find('tbody tr').trigger('click')
    expect(storeState.selectDeal).toHaveBeenCalledWith('abc')
  })

  it('calls selectDeal when Enter is pressed on a row', async () => {
    storeState.deals = [makeDeal({ dealId: 'abc' })]
    const wrapper = mount(DealTable)
    await wrapper.find('tbody tr').trigger('keydown.enter')
    expect(storeState.selectDeal).toHaveBeenCalledWith('abc')
  })

  it('calls setSort and fetchDealsList when a sortable column header is clicked', async () => {
    storeState.deals = [makeDeal()]
    const wrapper = mount(DealTable)
    await wrapper.find('th[aria-sort]').trigger('click')
    expect(storeState.setSort).toHaveBeenCalled()
    expect(storeState.fetchDealsList).toHaveBeenCalled()
  })

  it('rows have focus-visible ring class for keyboard navigation', () => {
    storeState.deals = [makeDeal()]
    const wrapper = mount(DealTable)
    const row = wrapper.find('tbody tr')
    expect(row.classes().join(' ')).toContain('focus-visible:ring-2')
  })

  it('selected row has highlight class', () => {
    storeState.deals = [makeDeal({ dealId: 'd1' })]
    storeState.selectedDealId = 'd1'
    const wrapper = mount(DealTable)
    expect(wrapper.find('tbody tr').classes()).toContain('bg-blue-50')
  })
})
