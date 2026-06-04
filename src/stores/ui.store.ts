import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const isFiltersOpen = ref(false)

  function toggleFilters() {
    isFiltersOpen.value = !isFiltersOpen.value
  }

  function closeFilters() {
    isFiltersOpen.value = false
  }

  return { isFiltersOpen, toggleFilters, closeFilters }
})
