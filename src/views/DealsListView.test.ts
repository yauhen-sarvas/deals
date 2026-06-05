import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}))

const dealsStore = { fetchDealsList: vi.fn(), selectedDealId: null as string | null }
vi.mock('@/stores/deals.store', () => ({
  useDealsStore: () => dealsStore,
}))

vi.mock('@/composables/useRealtime', () => ({
  useRealtime: () => ({ stop: vi.fn() }),
}))

vi.mock('@/components/deals/DealsToolbar.vue', () => ({
  default: { template: '<div class="toolbar-stub" />' },
}))
vi.mock('@/components/deals/DealsFiltersPanel.vue', () => ({
  default: { template: '<div class="filters-stub" />' },
}))
vi.mock('@/components/deals/DealTable.vue', () => ({
  default: { template: '<div class="table-stub" />' },
}))
vi.mock('@/components/deals/DealDetailPanel.vue', () => ({
  default: { template: '<div class="panel-stub" />' },
}))
vi.mock('@/components/common/ErrorBoundary.vue', () => ({
  default: { template: '<slot />' },
}))
vi.mock('@/components/deals/DealsPagination.vue', () => ({
  default: { template: '<div class="pagination-stub" />' },
}))

import DealsListView from './DealsListView.vue'

describe('DealsListView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    dealsStore.selectedDealId = null
  })

  it('calls fetchDealsList on mount', () => {
    mount(DealsListView)
    expect(dealsStore.fetchDealsList).toHaveBeenCalledTimes(1)
  })

  it('renders the toolbar', () => {
    const wrapper = mount(DealsListView)
    expect(wrapper.find('.toolbar-stub').exists()).toBe(true)
  })

  it('renders the deals table', () => {
    const wrapper = mount(DealsListView)
    expect(wrapper.find('.table-stub').exists()).toBe(true)
  })

  it('renders pagination', () => {
    const wrapper = mount(DealsListView)
    expect(wrapper.find('.pagination-stub').exists()).toBe(true)
  })

  it('does not render DealDetailPanel when no deal is selected', () => {
    dealsStore.selectedDealId = null
    const wrapper = mount(DealsListView)
    expect(wrapper.find('.panel-stub').exists()).toBe(false)
  })

  it('renders DealDetailPanel when a deal is selected', () => {
    dealsStore.selectedDealId = 'd1'
    const wrapper = mount(DealsListView)
    expect(wrapper.find('.panel-stub').exists()).toBe(true)
  })

  it('renders the view title', () => {
    const wrapper = mount(DealsListView)
    expect(wrapper.text()).toContain('deals.title')
  })

  it('renders the view subtitle', () => {
    const wrapper = mount(DealsListView)
    expect(wrapper.text()).toContain('deals.subtitle')
  })
})
