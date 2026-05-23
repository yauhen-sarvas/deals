import { computed } from 'vue'
import { useDealsStore } from '@/stores/deals.store'

export function usePagination() {
  const store = useDealsStore()

  const totalPages = computed(() =>
    Math.max(1, Math.ceil(store.pagination.total / store.pagination.pageSize)),
  )

  const hasPrev = computed(() => store.pagination.page > 1)
  const hasNext = computed(() => store.pagination.page < totalPages.value)

  const pageNumbers = computed<number[]>(() => {
    const total = totalPages.value
    const current = store.pagination.page
    const delta = 2
    const pages: number[] = []

    const rangeStart = Math.max(1, current - delta)
    const rangeEnd = Math.min(total, current + delta)

    if (rangeStart > 1) {
      pages.push(1)
      if (rangeStart > 2) pages.push(-1)
    }

    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i)
    }

    if (rangeEnd < total) {
      if (rangeEnd < total - 1) pages.push(-1)
      pages.push(total)
    }

    return pages
  })

  function goToPage(page: number) {
    store.setPage(page)
    store.fetchDealsList()
  }

  function prevPage() {
    if (hasPrev.value) goToPage(store.pagination.page - 1)
  }

  function nextPage() {
    if (hasNext.value) goToPage(store.pagination.page + 1)
  }

  return {
    pagination: computed(() => store.pagination),
    totalPages,
    hasPrev,
    hasNext,
    pageNumbers,
    goToPage,
    prevPage,
    nextPage,
  }
}
