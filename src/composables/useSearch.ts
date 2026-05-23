import { ref, watch } from 'vue'
import { useDealsStore } from '@/stores/deals.store'
import { SEARCH_DEBOUNCE_MS } from '@/constants/api'

export function useSearch() {
  const store = useDealsStore()
  const localQuery = ref(store.search)
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  watch(() => store.search, (value) => {
    if (localQuery.value !== value) localQuery.value = value
  })

  watch(localQuery, (value) => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      store.setSearch(value.trim().toLowerCase())
      store.fetchDealsList()
    }, SEARCH_DEBOUNCE_MS)
  })

  function clearSearch() {
    localQuery.value = ''
    store.setSearch('')
    store.fetchDealsList()
  }

  return { localQuery, clearSearch }
}
