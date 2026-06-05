import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppBadge from './AppBadge.vue'

describe('AppBadge', () => {
  it('renders slot content', () => {
    const wrapper = mount(AppBadge, { slots: { default: 'Open' } })
    expect(wrapper.text()).toBe('Open')
  })

  it('applies default variant classes', () => {
    const wrapper = mount(AppBadge)
    expect(wrapper.classes()).toContain('bg-gray-100')
    expect(wrapper.classes()).toContain('text-gray-700')
  })

  it.each([
    ['success', 'bg-emerald-100', 'text-emerald-800'],
    ['warning', 'bg-amber-100', 'text-amber-800'],
    ['danger', 'bg-red-100', 'text-red-700'],
    ['info', 'bg-blue-100', 'text-blue-800'],
  ] as const)('applies %s variant classes', (variant, bg, text) => {
    const wrapper = mount(AppBadge, { props: { variant } })
    expect(wrapper.classes()).toContain(bg)
    expect(wrapper.classes()).toContain(text)
  })

  it('applies customClass when variant is custom', () => {
    const wrapper = mount(AppBadge, {
      props: { variant: 'custom', customClass: 'bg-pink-100 text-pink-800' },
    })
    expect(wrapper.classes()).toContain('bg-pink-100')
    expect(wrapper.classes()).toContain('text-pink-800')
  })

  it('does not apply variant class when variant is custom', () => {
    const wrapper = mount(AppBadge, {
      props: { variant: 'custom', customClass: 'bg-pink-100' },
    })
    expect(wrapper.classes()).not.toContain('bg-gray-100')
  })

  it('renders as a span', () => {
    const wrapper = mount(AppBadge)
    expect(wrapper.element.tagName).toBe('SPAN')
  })
})
