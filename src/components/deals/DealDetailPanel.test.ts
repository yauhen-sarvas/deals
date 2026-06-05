import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import type { Deal } from '@/types/deals.types'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key, locale: { value: 'en' } }),
}))

const dealsStore = {
  currentDeal: null as Deal | null,
  isLoadingDetail: false,
  detailError: null as { message: string; status?: number } | null,
  selectedDealId: 'd1' as string | null,
  clearSelectedDeal: vi.fn(),
  fetchDealDetail: vi.fn(),
}

vi.mock('@/stores/deals.store', () => ({
  useDealsStore: () => dealsStore,
}))

const authStore = { currentRole: 'Admin' }
vi.mock('@/stores/auth.store', () => ({
  useAuthStore: () => authStore,
}))

vi.mock('@/utils/smartTags', () => ({
  computeSmartTags: vi.fn(() => []),
  SMART_TAG_COLORS: {},
  SMART_TAG_I18N_KEYS: {},
}))

vi.mock('@/utils/formatters', () => ({
  formatCurrency: (amount: number) => `$${amount}`,
  formatDate: (date: string) => date,
  formatDateRelative: () => 'just now',
}))

vi.mock('@/constants/http', () => ({
  HTTP_CODES: { FORBIDDEN: 403 },
}))

import DealDetailPanel from './DealDetailPanel.vue'

function makeDeal(partial: Partial<Deal> = {}): Deal {
  return {
    dealId: 'd1', dealName: 'Acme Deal', accountName: 'Acme Corp',
    status: 'Open', amount: 9000,
    createdDate: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-06-01T00:00:00.000Z',
    ...partial,
  }
}

describe('DealDetailPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    dealsStore.currentDeal = null
    dealsStore.isLoadingDetail = false
    dealsStore.detailError = null
    dealsStore.selectedDealId = 'd1'
    authStore.currentRole = 'Admin'
  })

  it('shows LoadingState when isLoadingDetail is true', () => {
    dealsStore.isLoadingDetail = true
    const wrapper = mount(DealDetailPanel)
    expect(wrapper.find('.animate-spin').exists()).toBe(true)
  })

  it('shows ErrorState when detailError is set', () => {
    dealsStore.detailError = { message: 'Deal not found' }
    const wrapper = mount(DealDetailPanel)
    expect(wrapper.text()).toContain('Deal not found')
  })

  it('renders deal name when currentDeal is set', () => {
    dealsStore.currentDeal = makeDeal({ dealName: 'Big Deal' })
    const wrapper = mount(DealDetailPanel)
    expect(wrapper.text()).toContain('Big Deal')
  })

  it('renders account name when currentDeal is set', () => {
    dealsStore.currentDeal = makeDeal({ accountName: 'Globex' })
    const wrapper = mount(DealDetailPanel)
    expect(wrapper.text()).toContain('Globex')
  })

  it('renders formatted amount when currentDeal is set', () => {
    dealsStore.currentDeal = makeDeal({ amount: 9000 })
    const wrapper = mount(DealDetailPanel)
    expect(wrapper.text()).toContain('$9000')
  })

  it('calls clearSelectedDeal when close button is clicked', async () => {
    const wrapper = mount(DealDetailPanel)
    await wrapper.find('button[aria-label="common.close"]').trigger('click')
    expect(dealsStore.clearSelectedDeal).toHaveBeenCalled()
  })

  it('calls clearSelectedDeal on Escape key', () => {
    mount(DealDetailPanel)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(dealsStore.clearSelectedDeal).toHaveBeenCalled()
  })

  it('shows unassigned text when no assignedPartnerId', () => {
    dealsStore.currentDeal = makeDeal({ assignedPartnerId: undefined })
    const wrapper = mount(DealDetailPanel)
    expect(wrapper.text()).toContain('deals.detail.unassigned')
  })

  it('close button has focus-visible ring class', () => {
    const wrapper = mount(DealDetailPanel)
    expect(wrapper.find('button').classes().join(' ')).toContain('focus-visible:ring-2')
  })
})
