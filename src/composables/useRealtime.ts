import { onMounted, onUnmounted } from 'vue'
import { useDealsStore } from '@/stores/deals.store'
import { fetchDeals } from '@/services/deals.service'

/*
 * Polling chosen over WebSocket for the following reasons:
 * - Partner portal data changes infrequently (deal status updates happen
 *   minutes apart, not milliseconds). Polling every 30s is sufficient.
 * - No persistent server-side connection needed — stateless HTTP fits the
 *   REST-first architecture already in use.
 * - WebSocket adds operational complexity (connection management, fallback,
 *   reconnect logic, server infrastructure). Polling is simpler to deploy,
 *   monitor, and debug.
 * - At the expected scale (<1000 concurrent partners), polling load is trivial.
 * See DECISIONS.md §4 for full trade-off analysis.
 */
export function useRealtime(intervalMs = 30_000) {
  const store = useDealsStore()
  let timer: ReturnType<typeof setInterval> | null = null

  async function poll() {
    if (document.visibilityState === 'hidden') return
    if (store.isLoading) return

    try {
      const response = await fetchDeals(
        store.filters,
        store.search,
        { page: store.pagination.page, pageSize: store.pagination.pageSize },
      )
      store.mergeDeals(response.data)
    } catch {
      // Silent — polling failure should not disrupt the UI
    }
  }

  function start() {
    timer = setInterval(poll, intervalMs)
  }

  function stop() {
    if (timer !== null) {
      clearInterval(timer)
      timer = null
    }
  }

  onMounted(start)
  onUnmounted(stop)

  return { stop }
}
