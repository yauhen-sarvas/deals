import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}))

// localFilters is a plain object (auto-unwrapped in template as if it were a ref)
const localFilters = {
  status: [] as string[],
  amountMin: null as number | null,
  amountMax: null as number | null,
  dateFrom: null as string | null,
  dateTo: null as string | null,
  accountName: '',
  dealName: '',
}

const composableState = {
  amountError: null as string | null,
  dateError: null as string | null,
  applyFilters: vi.fn(),
  clearFilters: vi.fn(),
  toggleStatus: vi.fn(),
}

vi.mock('@/composables/useFilters', () => ({
  useFilters: () => ({
    localFilters,
    get amountError() { return composableState.amountError },
    get dateError() { return composableState.dateError },
    toggleStatus: composableState.toggleStatus,
    applyFilters: composableState.applyFilters,
    clearFilters: composableState.clearFilters,
  }),
}))

const storeState = { isLoading: false }
vi.mock('@/stores/deals.store', () => ({
  useDealsStore: () => storeState,
}))

import DealFilters from './DealFilters.vue'

describe('DealFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    composableState.amountError = null
    composableState.dateError = null
    storeState.isLoading = false
    localFilters.status = []
  })

  it('renders status checkboxes for Open, Approved, Rejected', () => {
    const wrapper = mount(DealFilters)
    const labels = wrapper.findAll('label').map(l => l.text())
    expect(labels.join(' ')).toContain('deals.status.Open')
    expect(labels.join(' ')).toContain('deals.status.Approved')
    expect(labels.join(' ')).toContain('deals.status.Rejected')
  })

  it('renders Apply and Clear buttons', () => {
    const wrapper = mount(DealFilters)
    const texts = wrapper.findAll('button').map(b => b.text())
    expect(texts.join(' ')).toContain('deals.filters.apply')
    expect(texts.join(' ')).toContain('deals.filters.clear')
  })

  it('Apply button is enabled when no validation errors', () => {
    const wrapper = mount(DealFilters)
    const applyBtn = wrapper.findAll('button').find(b => b.text().includes('deals.filters.apply'))
    expect((applyBtn!.element as HTMLButtonElement).disabled).toBe(false)
  })

  it('Apply button is disabled when amountError is set', () => {
    composableState.amountError = 'deals.filters.amountError'
    const wrapper = mount(DealFilters)
    const applyBtn = wrapper.findAll('button').find(b => b.text().includes('deals.filters.apply'))
    expect((applyBtn!.element as HTMLButtonElement).disabled).toBe(true)
  })

  it('Apply button is disabled when dateError is set', () => {
    composableState.dateError = 'deals.filters.dateError'
    const wrapper = mount(DealFilters)
    const applyBtn = wrapper.findAll('button').find(b => b.text().includes('deals.filters.apply'))
    expect((applyBtn!.element as HTMLButtonElement).disabled).toBe(true)
  })

  it('Apply button shows loading spinner when store is loading', () => {
    storeState.isLoading = true
    const wrapper = mount(DealFilters)
    expect(wrapper.find('span.animate-spin').exists()).toBe(true)
  })

  it('calls applyFilters when Apply button is clicked', async () => {
    const wrapper = mount(DealFilters)
    const applyBtn = wrapper.findAll('button').find(b => b.text().includes('deals.filters.apply'))
    await applyBtn!.trigger('click')
    expect(composableState.applyFilters).toHaveBeenCalled()
  })

  it('calls clearFilters when Clear button is clicked', async () => {
    const wrapper = mount(DealFilters)
    const clearBtn = wrapper.findAll('button').find(b => b.text().includes('deals.filters.clear'))
    await clearBtn!.trigger('click')
    expect(composableState.clearFilters).toHaveBeenCalled()
  })
})
