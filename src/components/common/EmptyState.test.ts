import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import EmptyState from './EmptyState.vue'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}))

describe('EmptyState', () => {
  it('shows noFilters message when hasFilters is false', () => {
    const wrapper = mount(EmptyState, { props: { hasFilters: false } })
    expect(wrapper.text()).toContain('deals.empty.noFilters')
  })

  it('shows description message when hasFilters is true', () => {
    const wrapper = mount(EmptyState, { props: { hasFilters: true } })
    expect(wrapper.text()).toContain('deals.empty.description')
  })

  it('always shows the title', () => {
    const wrapper = mount(EmptyState)
    expect(wrapper.text()).toContain('deals.empty.title')
  })

  it('shows clear-filters button when hasFilters is true', () => {
    const wrapper = mount(EmptyState, { props: { hasFilters: true } })
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('does not show clear-filters button when hasFilters is false', () => {
    const wrapper = mount(EmptyState, { props: { hasFilters: false } })
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('emits clearFilters when button is clicked', async () => {
    const wrapper = mount(EmptyState, { props: { hasFilters: true } })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('clearFilters')).toBeTruthy()
  })

  it('has aria-hidden on the decorative SVG', () => {
    const wrapper = mount(EmptyState)
    expect(wrapper.find('svg').attributes('aria-hidden')).toBe('true')
  })
})
