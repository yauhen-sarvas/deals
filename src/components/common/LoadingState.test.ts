import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import LoadingState from './LoadingState.vue'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}))

describe('LoadingState', () => {
  it('renders the animated spinner element', () => {
    const wrapper = mount(LoadingState)
    expect(wrapper.find('.animate-spin').exists()).toBe(true)
  })

  it('renders the loading text key', () => {
    const wrapper = mount(LoadingState)
    expect(wrapper.text()).toContain('common.loading')
  })
})
