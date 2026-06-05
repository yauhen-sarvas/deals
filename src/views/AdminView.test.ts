import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import type { Deal } from '@/types/deals.types'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}))

const storeState = {
  isLoading: false,
  pagination: { total: 100, page: 1, pageSize: 20 },
  deals: [] as Deal[],
}
vi.mock('@/stores/deals.store', () => ({
  useDealsStore: () => storeState,
}))

import AdminView from './AdminView.vue'

function makeDeal(status: Deal['status']): Deal {
  return {
    dealId: Math.random().toString(),
    dealName: 'Deal', accountName: 'Corp', status,
    amount: 1000, createdDate: '2024-01-01T00:00:00.000Z', updatedAt: '2024-06-01T00:00:00.000Z',
  }
}

describe('AdminView', () => {
  beforeEach(() => {
    storeState.isLoading = false
    storeState.pagination = { total: 100, page: 1, pageSize: 20 }
    storeState.deals = []
  })

  it('shows LoadingState when isLoading is true', () => {
    storeState.isLoading = true
    const wrapper = mount(AdminView)
    expect(wrapper.find('.animate-spin').exists()).toBe(true)
  })

  it('shows stats grid when not loading', () => {
    storeState.isLoading = false
    const wrapper = mount(AdminView)
    expect(wrapper.find('.animate-spin').exists()).toBe(false)
    expect(wrapper.text()).toContain('admin.stats.total')
  })

  it('shows total from pagination.total', () => {
    storeState.pagination.total = 42
    const wrapper = mount(AdminView)
    expect(wrapper.text()).toContain('42')
  })

  it('counts Open deals correctly', () => {
    storeState.deals = [makeDeal('Open'), makeDeal('Open'), makeDeal('Approved')]
    const wrapper = mount(AdminView)
    const statCards = wrapper.findAll('.rounded-lg.border.border-gray-200')
    const openCard = statCards.find(c => c.text().includes('deals.status.Open'))
    expect(openCard!.text()).toContain('2')
  })

  it('counts Approved deals correctly', () => {
    storeState.deals = [makeDeal('Approved'), makeDeal('Open')]
    const wrapper = mount(AdminView)
    const statCards = wrapper.findAll('.rounded-lg.border.border-gray-200')
    const approvedCard = statCards.find(c => c.text().includes('deals.status.Approved'))
    expect(approvedCard!.text()).toContain('1')
  })

  it('counts Rejected deals correctly', () => {
    storeState.deals = [makeDeal('Rejected'), makeDeal('Rejected'), makeDeal('Open')]
    const wrapper = mount(AdminView)
    const statCards = wrapper.findAll('.rounded-lg.border.border-gray-200')
    const rejectedCard = statCards.find(c => c.text().includes('deals.status.Rejected'))
    expect(rejectedCard!.text()).toContain('2')
  })

  it('renders admin title and subtitle', () => {
    const wrapper = mount(AdminView)
    expect(wrapper.text()).toContain('admin.title')
    expect(wrapper.text()).toContain('admin.subtitle')
  })

  it('renders the info banner', () => {
    const wrapper = mount(AdminView)
    expect(wrapper.text()).toContain('admin.info.title')
  })
})
