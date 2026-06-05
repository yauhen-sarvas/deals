import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}))

const dealsStore = {
  activeFilterCount: 0,
  pagination: { pageSize: 20, page: 1, total: 0 },
  fetchDealsList: vi.fn(),
  clearFilters: vi.fn(),
  setSearch: vi.fn(),
  setPageSize: vi.fn(),
}
vi.mock('@/stores/deals.store', () => ({
  useDealsStore: () => dealsStore,
}))

const uiStore = { toggleFilters: vi.fn(), isFiltersOpen: false }
vi.mock('@/stores/ui.store', () => ({
  useUiStore: () => uiStore,
}))

vi.mock('./DealSearch.vue', () => ({
  default: { template: '<input class="deal-search-stub" />' },
}))

vi.mock('@/constants/pagination', () => ({
  PAGE_SIZE_OPTIONS: [10, 20, 50],
}))

import DealsToolbar from './DealsToolbar.vue'

describe('DealsToolbar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    dealsStore.activeFilterCount = 0
    dealsStore.pagination = { pageSize: 20, page: 1, total: 0 }
    uiStore.isFiltersOpen = false
  })

  it('renders the search input stub', () => {
    const wrapper = mount(DealsToolbar)
    expect(wrapper.find('.deal-search-stub').exists()).toBe(true)
  })

  it('calls toggleFilters when filter button is clicked', async () => {
    const wrapper = mount(DealsToolbar)
    const filterBtn = wrapper.findAll('button').find(b => b.text().includes('deals.filters.title'))
    await filterBtn!.trigger('click')
    expect(uiStore.toggleFilters).toHaveBeenCalled()
  })

  it('does not show Clear All button when no active filters', () => {
    dealsStore.activeFilterCount = 0
    const wrapper = mount(DealsToolbar)
    expect(wrapper.text()).not.toContain('common.clearFilters')
  })

  it('shows Clear All button when filters are active and panel is closed', () => {
    dealsStore.activeFilterCount = 2
    uiStore.isFiltersOpen = false
    const wrapper = mount(DealsToolbar)
    expect(wrapper.text()).toContain('common.clearFilters')
  })

  it('calls clearFilters, setSearch, and fetchDealsList when Clear All clicked', async () => {
    dealsStore.activeFilterCount = 1
    uiStore.isFiltersOpen = false
    const wrapper = mount(DealsToolbar)
    const clearBtn = wrapper.findAll('button').find(b => b.text().includes('common.clearFilters'))
    await clearBtn!.trigger('click')
    expect(dealsStore.clearFilters).toHaveBeenCalled()
    expect(dealsStore.setSearch).toHaveBeenCalledWith('')
    expect(dealsStore.fetchDealsList).toHaveBeenCalled()
  })

  it('shows page size select with options', () => {
    const wrapper = mount(DealsToolbar)
    expect(wrapper.find('select').exists()).toBe(true)
    expect(wrapper.findAll('option')).toHaveLength(3)
  })

  it('calls setPageSize and fetchDealsList when page size changes', async () => {
    const wrapper = mount(DealsToolbar)
    const select = wrapper.find('select')
    const el = select.element as HTMLSelectElement
    el.value = '50'
    await select.trigger('change')
    expect(dealsStore.setPageSize).toHaveBeenCalledWith(50)
    expect(dealsStore.fetchDealsList).toHaveBeenCalled()
  })
})
