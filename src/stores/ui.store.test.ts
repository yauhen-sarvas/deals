import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUiStore } from './ui.store'

describe('useUiStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('initial state', () => {
    it('isFiltersOpen starts as false', () => {
      expect(useUiStore().isFiltersOpen).toBe(false)
    })

    it('isMobileMenuOpen starts as false', () => {
      expect(useUiStore().isMobileMenuOpen).toBe(false)
    })
  })

  describe('toggleFilters', () => {
    it('sets isFiltersOpen to true when it was false', () => {
      const store = useUiStore()
      store.toggleFilters()
      expect(store.isFiltersOpen).toBe(true)
    })

    it('sets isFiltersOpen to false when it was true', () => {
      const store = useUiStore()
      store.toggleFilters()
      store.toggleFilters()
      expect(store.isFiltersOpen).toBe(false)
    })
  })

  describe('closeFilters', () => {
    it('sets isFiltersOpen to false regardless of current state', () => {
      const store = useUiStore()
      store.toggleFilters()
      store.closeFilters()
      expect(store.isFiltersOpen).toBe(false)
    })

    it('is a no-op when filters are already closed', () => {
      const store = useUiStore()
      store.closeFilters()
      expect(store.isFiltersOpen).toBe(false)
    })
  })

  describe('toggleMobileMenu', () => {
    it('sets isMobileMenuOpen to true when it was false', () => {
      const store = useUiStore()
      store.toggleMobileMenu()
      expect(store.isMobileMenuOpen).toBe(true)
    })

    it('sets isMobileMenuOpen to false when it was true', () => {
      const store = useUiStore()
      store.toggleMobileMenu()
      store.toggleMobileMenu()
      expect(store.isMobileMenuOpen).toBe(false)
    })

    it('does not affect isFiltersOpen', () => {
      const store = useUiStore()
      store.toggleMobileMenu()
      expect(store.isFiltersOpen).toBe(false)
    })
  })
})
