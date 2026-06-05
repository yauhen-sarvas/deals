import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}))

const uiState = { isFiltersOpen: false, closeFilters: vi.fn() }
vi.mock('@/stores/ui.store', () => ({
  useUiStore: () => uiState,
}))

vi.mock('./DealFilters.vue', () => ({
  default: { template: '<div class="deal-filters-stub" />' },
}))

import DealsFiltersPanel from './DealsFiltersPanel.vue'

describe('DealsFiltersPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    uiState.isFiltersOpen = false
  })

  it('is not visible when isFiltersOpen is false', () => {
    const wrapper = mount(DealsFiltersPanel)
    expect(wrapper.find('[role="region"]').exists()).toBe(false)
  })

  it('is visible when isFiltersOpen is true', () => {
    uiState.isFiltersOpen = true
    const wrapper = mount(DealsFiltersPanel)
    expect(wrapper.find('[role="region"]').exists()).toBe(true)
  })

  it('calls closeFilters when close button is clicked', async () => {
    uiState.isFiltersOpen = true
    const wrapper = mount(DealsFiltersPanel)
    await wrapper.find('button[aria-label="common.close"]').trigger('click')
    expect(uiState.closeFilters).toHaveBeenCalled()
  })

  it('calls closeFilters on Escape key when panel is open', async () => {
    uiState.isFiltersOpen = true
    mount(DealsFiltersPanel)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(uiState.closeFilters).toHaveBeenCalled()
  })

  it('does not call closeFilters on Escape when panel is closed', () => {
    uiState.isFiltersOpen = false
    mount(DealsFiltersPanel)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(uiState.closeFilters).not.toHaveBeenCalled()
  })

  it('panel has role=region', () => {
    uiState.isFiltersOpen = true
    const wrapper = mount(DealsFiltersPanel)
    expect(wrapper.find('[role="region"]').exists()).toBe(true)
  })
})
