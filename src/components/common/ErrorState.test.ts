import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ErrorState from './ErrorState.vue'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}))

describe('ErrorState', () => {
  it('shows retry button by default', () => {
    const wrapper = mount(ErrorState)
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('hides retry button when showRetry is false', () => {
    const wrapper = mount(ErrorState, { props: { showRetry: false } })
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('emits retry when button is clicked', async () => {
    const wrapper = mount(ErrorState)
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('retry')).toBeTruthy()
  })

  it('shows message prop when provided', () => {
    const wrapper = mount(ErrorState, { props: { message: 'Custom error detail' } })
    expect(wrapper.text()).toContain('Custom error detail')
  })

  it('does not show message element when message is not provided', () => {
    const wrapper = mount(ErrorState)
    const paragraphs = wrapper.findAll('p')
    const texts = paragraphs.map(p => p.text())
    expect(texts.every(t => t !== '')).toBe(true)
  })

  it.each([
    ['network', 'deals.errors.networkError'],
    ['server', 'deals.errors.serverError'],
    ['notFound', 'deals.errors.notFound'],
    ['forbidden', 'deals.errors.forbidden'],
    ['generic', 'deals.errors.loadFailed'],
  ] as const)('type %s shows correct i18n title key', (type, expectedKey) => {
    const wrapper = mount(ErrorState, { props: { type } })
    expect(wrapper.text()).toContain(expectedKey)
  })

  it('has aria-hidden on the decorative SVG', () => {
    const wrapper = mount(ErrorState)
    expect(wrapper.find('svg').attributes('aria-hidden')).toBe('true')
  })
})
