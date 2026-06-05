import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AppButton from './AppButton.vue'

describe('AppButton', () => {
  it('renders slot content', () => {
    const wrapper = mount(AppButton, { slots: { default: 'Click me' } })
    expect(wrapper.text()).toContain('Click me')
  })

  it('renders as a button element', () => {
    const wrapper = mount(AppButton)
    expect(wrapper.element.tagName).toBe('BUTTON')
  })

  it('has type=button by default', () => {
    const wrapper = mount(AppButton)
    expect(wrapper.attributes('type')).toBe('button')
  })

  it('sets type attribute when provided', () => {
    const wrapper = mount(AppButton, { props: { type: 'submit' } })
    expect(wrapper.attributes('type')).toBe('submit')
  })

  it.each([
    ['primary', 'bg-blue-600'],
    ['secondary', 'bg-white'],
    ['ghost', 'bg-transparent'],
    ['danger', 'bg-red-600'],
    ['warning', 'text-amber-600'],
  ] as const)('%s variant applies correct class', (variant, cls) => {
    const wrapper = mount(AppButton, { props: { variant } })
    expect(wrapper.classes().join(' ')).toContain(cls)
  })

  it.each([
    ['sm', 'px-3'],
    ['md', 'px-4'],
    ['lg', 'px-6'],
  ] as const)('%s size applies correct padding', (size, cls) => {
    const wrapper = mount(AppButton, { props: { size } })
    expect(wrapper.classes()).toContain(cls)
  })

  it('is disabled when disabled prop is true', () => {
    const wrapper = mount(AppButton, { props: { disabled: true } })
    expect((wrapper.element as HTMLButtonElement).disabled).toBe(true)
  })

  it('does not emit click when disabled', async () => {
    const wrapper = mount(AppButton, { props: { disabled: true } })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('shows loading spinner when loading is true', () => {
    const wrapper = mount(AppButton, { props: { loading: true } })
    expect(wrapper.find('span.animate-spin').exists()).toBe(true)
  })

  it('is disabled when loading', () => {
    const wrapper = mount(AppButton, { props: { loading: true } })
    expect((wrapper.element as HTMLButtonElement).disabled).toBe(true)
  })

  it('does not show spinner when not loading', () => {
    const wrapper = mount(AppButton, { props: { loading: false } })
    expect(wrapper.find('span.animate-spin').exists()).toBe(false)
  })
})
