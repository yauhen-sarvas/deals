import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import type { Deal } from '@/types/deals.types'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key, locale: { value: 'en' } }),
}))

const selectDeal = vi.fn()
vi.mock('@/stores/deals.store', () => ({
  useDealsStore: () => ({ selectDeal }),
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

import DealCard from './DealCard.vue'

function makeDeal(partial: Partial<Deal> = {}): Deal {
  return {
    dealId: 'd1',
    dealName: 'Acme Deal',
    accountName: 'Acme Corp',
    status: 'Open',
    amount: 5000,
    createdDate: '2024-01-15T00:00:00.000Z',
    updatedAt: '2024-06-01T00:00:00.000Z',
    ...partial,
  }
}

describe('DealCard', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders deal name', () => {
    const wrapper = mount(DealCard, { props: { deal: makeDeal() } })
    expect(wrapper.text()).toContain('Acme Deal')
  })

  it('renders account name', () => {
    const wrapper = mount(DealCard, { props: { deal: makeDeal() } })
    expect(wrapper.text()).toContain('Acme Corp')
  })

  it('renders formatted amount', () => {
    const wrapper = mount(DealCard, { props: { deal: makeDeal({ amount: 5000 }) } })
    expect(wrapper.text()).toContain('$5000')
  })

  it('has aria-label with deal name', () => {
    const wrapper = mount(DealCard, { props: { deal: makeDeal() } })
    expect(wrapper.attributes('aria-label')).toBe('Acme Deal')
  })

  it('calls selectDeal with dealId on click', async () => {
    const wrapper = mount(DealCard, { props: { deal: makeDeal({ dealId: 'xyz' }) } })
    await wrapper.trigger('click')
    expect(selectDeal).toHaveBeenCalledWith('xyz')
  })

  it('calls selectDeal with dealId on Enter key', async () => {
    const wrapper = mount(DealCard, { props: { deal: makeDeal({ dealId: 'xyz' }) } })
    await wrapper.trigger('keydown.enter')
    expect(selectDeal).toHaveBeenCalledWith('xyz')
  })

  it('has role=button', () => {
    const wrapper = mount(DealCard, { props: { deal: makeDeal() } })
    expect(wrapper.attributes('role')).toBe('button')
  })

  it('has tabindex=0', () => {
    const wrapper = mount(DealCard, { props: { deal: makeDeal() } })
    expect(wrapper.attributes('tabindex')).toBe('0')
  })
})
