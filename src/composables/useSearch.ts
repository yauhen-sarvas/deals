import { ref, watch, onUnmounted } from 'vue'
import { useDealsStore } from '@/stores/deals.store'
import { SEARCH_DEBOUNCE_MS } from '@/constants/api'

export function useSearch() {
  const store = useDealsStore()
  const localQuery = ref(store.search)
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  watch(() => store.search, (value) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }
    localQuery.value = value
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

  onUnmounted(() => { if (debounceTimer) clearTimeout(debounceTimer) })

  return { localQuery, clearSearch }
}
