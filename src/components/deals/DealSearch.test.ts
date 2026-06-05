import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}))

const localQuery = ref('')
const clearSearch = vi.fn(() => { localQuery.value = '' })

vi.mock('@/composables/useSearch', () => ({
  useSearch: () => ({ localQuery, clearSearch }),
}))

import DealSearch from './DealSearch.vue'

describe('DealSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localQuery.value = ''
  })

  it('renders a text input', () => {
    const wrapper = mount(DealSearch)
    expect(wrapper.find('input[type="text"]').exists()).toBe(true)
  })

  it('hides clear button when query is empty', () => {
    const wrapper = mount(DealSearch)
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('shows clear button when query is non-empty', async () => {
    localQuery.value = 'acme'
    const wrapper = mount(DealSearch)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('calls clearSearch when clear button is clicked', async () => {
    localQuery.value = 'acme'
    const wrapper = mount(DealSearch)
    await wrapper.vm.$nextTick()
    await wrapper.find('button').trigger('click')
    expect(clearSearch).toHaveBeenCalled()
  })

  it('calls clearSearch on Escape key in input', async () => {
    const wrapper = mount(DealSearch)
    await wrapper.find('input').trigger('keydown.escape')
    expect(clearSearch).toHaveBeenCalled()
  })

  it('clear button has aria-label', async () => {
    localQuery.value = 'test'
    const wrapper = mount(DealSearch)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('button').attributes('aria-label')).toBe('deals.search.clear')
  })

  it('has focus-visible ring class on clear button', async () => {
    localQuery.value = 'test'
    const wrapper = mount(DealSearch)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('button').classes().join(' ')).toContain('focus-visible:ring-2')
  })
})
