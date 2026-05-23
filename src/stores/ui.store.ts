import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const isFiltersOpen = ref(false)
  const isMobileMenuOpen = ref(false)

  function toggleFilters() {
    isFiltersOpen.value = !isFiltersOpen.value
  }

  function closeFilters() {
    isFiltersOpen.value = false
  }

  function toggleMobileMenu() {
    isMobileMenuOpen.value = !isMobileMenuOpen.value
  }

  return { isFiltersOpen, isMobileMenuOpen, toggleFilters, closeFilters, toggleMobileMenu }
})
