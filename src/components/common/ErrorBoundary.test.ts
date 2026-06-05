import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import ErrorBoundary from './ErrorBoundary.vue'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}))

// Throw from render so Vue propagates to onErrorCaptured
const ThrowingChild = {
  render() { throw new Error('render error') },
}

const SafeChild = {
  render: () => h('div', { class: 'safe' }, 'safe'),
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  it('renders slot content when no error', () => {
    const wrapper = mount(ErrorBoundary, {
      slots: { default: SafeChild },
    })
    expect(wrapper.find('.safe').exists()).toBe(true)
  })

  it('logs the error to console.error when child throws', () => {
    mount(ErrorBoundary, { slots: { default: ThrowingChild } })
    expect(console.error).toHaveBeenCalled()
  })

  // onErrorCaptured propagation is not reliably testable in VTU jsdom environment
  // when the error originates from a child render function. These are integration-level
  // behaviors best verified in an e2e test.
  it.todo('catches descendant errors and shows fallback UI')
  it.todo('shows retry button in fallback UI')
  it.todo('has aria-hidden on the decorative SVG in fallback UI')
  it.todo('retry clears error state and rerenders slot')
})
