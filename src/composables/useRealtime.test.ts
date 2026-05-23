import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'

// vi.hoisted is required so variables are accessible inside the hoisted vi.mock factory
const { mockFetchDeals } = vi.hoisted(() => ({
  mockFetchDeals: vi.fn(),
}))

vi.mock('@/services/deals.service', () => ({
  fetchDeals: mockFetchDeals,
  fetchDealById: vi.fn(),
  invalidateDealsCache: vi.fn(),
}))

vi.mock('@/utils/deduplication', () => ({
  deduplicateDeals: (deals: unknown[]) => deals,
}))

vi.mock('@/i18n', () => ({
  i18n: { global: { t: (key: string) => key } },
}))

import { useRealtime } from './useRealtime'
import { useDealsStore } from '@/stores/deals.store'

function mountRealtime(intervalMs?: number) {
  let result: ReturnType<typeof useRealtime>
  const TestComponent = defineComponent({
    setup() {
      result = useRealtime(intervalMs)
      return () => null
    },
    template: '<div></div>',
  })
  const wrapper = mount(TestComponent)
  return { wrapper, get result() { return result } }
}

describe('useRealtime', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
    vi.clearAllMocks()
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'visible',
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts an interval on mount', () => {
    vi.spyOn(global, 'setInterval')
    mountRealtime(1000)
    expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 1000)
  })

  it('clears the interval on unmount', () => {
    vi.spyOn(global, 'clearInterval')
    const { wrapper } = mountRealtime(1000)
    wrapper.unmount()
    expect(clearInterval).toHaveBeenCalled()
  })

  it('stop() clears the interval immediately', () => {
    vi.spyOn(global, 'clearInterval')
    const { result } = mountRealtime(1000)
    result.stop()
    expect(clearInterval).toHaveBeenCalled()
  })

  it('calls fetchDeals and mergeDeals when visible and not loading', async () => {
    const store = useDealsStore()
    mockFetchDeals.mockResolvedValue({ data: [], pagination: { page: 1, pageSize: 20, total: 0 } })
    vi.spyOn(store, 'mergeDeals')

    mountRealtime(1000)
    await vi.advanceTimersByTimeAsync(1000)

    expect(mockFetchDeals).toHaveBeenCalled()
    expect(store.mergeDeals).toHaveBeenCalled()
  })

  it('skips poll when document is hidden', async () => {
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'hidden',
    })

    mountRealtime(1000)
    await vi.advanceTimersByTimeAsync(1000)

    expect(mockFetchDeals).not.toHaveBeenCalled()
  })

  it('skips poll when store.isLoading is true', async () => {
    const store = useDealsStore()
    store.isLoading = true

    mountRealtime(1000)
    await vi.advanceTimersByTimeAsync(1000)

    expect(mockFetchDeals).not.toHaveBeenCalled()
  })

  it('does not throw when fetchDeals rejects (silent failure)', async () => {
    mockFetchDeals.mockRejectedValue(new Error('Network error'))

    const { wrapper } = mountRealtime(1000)
    await expect(vi.advanceTimersByTimeAsync(1000)).resolves.not.toThrow()
    wrapper.unmount()
  })

  it('polls multiple times at the given interval', async () => {
    mockFetchDeals.mockResolvedValue({ data: [], pagination: { page: 1, pageSize: 20, total: 0 } })

    mountRealtime(1000)
    await vi.advanceTimersByTimeAsync(3000)

    expect(mockFetchDeals).toHaveBeenCalledTimes(3)
  })
})
