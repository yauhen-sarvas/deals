import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import DealStatusBadge from './DealStatusBadge.vue'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}))

describe('DealStatusBadge', () => {
  it('renders Open status', () => {
    const wrapper = mount(DealStatusBadge, { props: { status: 'Open' } })
    expect(wrapper.text()).toContain('deals.status.Open')
  })

  it('renders Approved status', () => {
    const wrapper = mount(DealStatusBadge, { props: { status: 'Approved' } })
    expect(wrapper.text()).toContain('deals.status.Approved')
  })

  it('renders Rejected status', () => {
    const wrapper = mount(DealStatusBadge, { props: { status: 'Rejected' } })
    expect(wrapper.text()).toContain('deals.status.Rejected')
  })

  it('uses success variant for Approved', () => {
    const wrapper = mount(DealStatusBadge, { props: { status: 'Approved' } })
    expect(wrapper.find('span').classes()).toContain('bg-emerald-100')
  })

  it('uses danger variant for Rejected', () => {
    const wrapper = mount(DealStatusBadge, { props: { status: 'Rejected' } })
    expect(wrapper.find('span').classes()).toContain('bg-red-100')
  })

  it('uses info variant for Open', () => {
    const wrapper = mount(DealStatusBadge, { props: { status: 'Open' } })
    expect(wrapper.find('span').classes()).toContain('bg-blue-100')
  })
})
