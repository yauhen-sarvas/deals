import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string, params?: object) => params ? JSON.stringify(params) : key }),
}))

// Build a pagination object that satisfies:
//   template: pagination.page, pagination.total  (direct access, auto-unwrapped ref)
//   script computed: pagination.value.page, pagination.value.pageSize (explicit .value)
function makePagination(page: number, pageSize: number, total: number) {
  const data = { page, pageSize, total }
  return Object.assign(data, { value: data })
}

const paginationState = {
  pagination: makePagination(1, 20, 60),
  totalPages: { value: 3 },  // .value used in commitGoTo
  hasPrev: false,             // plain boolean auto-unwrapped in template
  hasNext: true,
  pageNumbers: [1, 2, 3],
  goToPage: vi.fn(),
  prevPage: vi.fn(),
  nextPage: vi.fn(),
}

vi.mock('@/composables/usePagination', () => ({
  usePagination: () => paginationState,
}))

const dealsState = { deals: [{ dealId: 'd1' }] as { dealId: string }[] }
vi.mock('@/stores/deals.store', () => ({
  useDealsStore: () => dealsState,
}))

import DealsPagination from './DealsPagination.vue'

describe('DealsPagination', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    paginationState.pagination = makePagination(1, 20, 60)
    paginationState.hasPrev = false
    paginationState.hasNext = true
    paginationState.totalPages = { value: 3 }
    paginationState.pageNumbers = [1, 2, 3]
    dealsState.deals = [{ dealId: 'd1' }]
  })

  it('renders nothing when deals list is empty', () => {
    dealsState.deals = []
    const wrapper = mount(DealsPagination)
    expect(wrapper.find('nav').exists()).toBe(false)
  })

  it('renders pagination nav when deals exist', () => {
    const wrapper = mount(DealsPagination)
    expect(wrapper.find('nav').exists()).toBe(true)
  })

  it('prev button is disabled on first page', () => {
    paginationState.hasPrev = false
    const wrapper = mount(DealsPagination)
    const prevBtn = wrapper.find('button[aria-label="deals.pagination.previous"]')
    expect((prevBtn.element as HTMLButtonElement).disabled).toBe(true)
  })

  it('prev button is enabled when not on first page', () => {
    paginationState.hasPrev = true
    const wrapper = mount(DealsPagination)
    const prevBtn = wrapper.find('button[aria-label="deals.pagination.previous"]')
    expect((prevBtn.element as HTMLButtonElement).disabled).toBe(false)
  })

  it('next button is disabled on last page', () => {
    paginationState.hasNext = false
    const wrapper = mount(DealsPagination)
    const nextBtn = wrapper.find('button[aria-label="deals.pagination.next"]')
    expect((nextBtn.element as HTMLButtonElement).disabled).toBe(true)
  })

  it('next button is enabled on non-last page', () => {
    paginationState.hasNext = true
    const wrapper = mount(DealsPagination)
    const nextBtn = wrapper.find('button[aria-label="deals.pagination.next"]')
    expect((nextBtn.element as HTMLButtonElement).disabled).toBe(false)
  })

  it('calls prevPage when prev button is clicked', async () => {
    paginationState.hasPrev = true
    const wrapper = mount(DealsPagination)
    await wrapper.find('button[aria-label="deals.pagination.previous"]').trigger('click')
    expect(paginationState.prevPage).toHaveBeenCalled()
  })

  it('calls nextPage when next button is clicked', async () => {
    const wrapper = mount(DealsPagination)
    await wrapper.find('button[aria-label="deals.pagination.next"]').trigger('click')
    expect(paginationState.nextPage).toHaveBeenCalled()
  })

  it('calls goToPage with valid page number on Enter in go-to input', async () => {
    const wrapper = mount(DealsPagination)
    const input = wrapper.find('input[type="number"]')
    await input.setValue('2')        // updates v-model ref via input event
    await input.trigger('keydown.enter')
    expect(paginationState.goToPage).toHaveBeenCalledWith(2)
  })

  it('does not call goToPage for out-of-range value', async () => {
    const wrapper = mount(DealsPagination)
    const input = wrapper.find('input[type="number"]')
    await input.setValue('99')
    await input.trigger('keydown.enter')
    expect(paginationState.goToPage).not.toHaveBeenCalled()
  })

  it('pagination nav has aria-label', () => {
    const wrapper = mount(DealsPagination)
    expect(wrapper.find('nav').attributes('aria-label')).toBe('deals.pagination.nav')
  })
})
