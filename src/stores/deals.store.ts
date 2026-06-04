import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Deal, DealFilters, PaginationMeta, StoreError } from '@/types/deals.types'
import { fetchDeals, fetchDealById, invalidateDealsCache } from '@/services/deals.service'
import { isRequestAborted } from '@/services/api.service'
import { HttpError } from '@/services/api.error'
import { deduplicateDeals } from '@/utils/deduplication'
import { DEFAULT_PAGE_SIZE } from '@/constants/pagination'
import { HTTP_CODES } from '@/constants/http'
import { i18n } from '@/i18n'

function toStoreError(err: unknown, fallbackKey: string): StoreError {
  const t = i18n.global.t
  if (err instanceof HttpError) {
    if (err.status === HTTP_CODES.NOT_FOUND) return { message: t('deals.errors.notFound'), status: err.status }
    if (err.status === HTTP_CODES.FORBIDDEN) return { message: t('deals.errors.forbidden'), status: err.status }
    if (err.status >= HTTP_CODES.INTERNAL_SERVER_ERROR) return { message: t('deals.errors.serverError'), status: err.status }
    return { message: t('deals.errors.networkError'), status: err.status }
  }
  if (err instanceof Error) return { message: t('deals.errors.networkError') }
  return { message: t(fallbackKey) }
}

export function defaultFilters(): DealFilters {
  return {
    status: [],
    amountMin: null,
    amountMax: null,
    dateFrom: null,
    dateTo: null,
    accountName: '',
    dealName: '',
  }
}

function initialState() {
  return {
    deals: [] as Deal[],
    currentDeal: null as Deal | null,
    selectedDealId: null as string | null,
    isLoading: false,
    isLoadingDetail: false,
    error: null as StoreError | null,
    detailError: null as StoreError | null,
    filters: defaultFilters(),
    search: '',
    sortBy: '' as keyof Deal | '',
    sortDir: 'asc' as 'asc' | 'desc',
    pagination: { page: 1, pageSize: DEFAULT_PAGE_SIZE, total: 0 } as PaginationMeta,
  }
}

export const useDealsStore = defineStore('deals', () => {
  const state = initialState()
  const deals = ref(state.deals)
  const currentDeal = ref(state.currentDeal)
  const selectedDealId = ref(state.selectedDealId)
  const isLoading = ref(state.isLoading)
  const isLoadingDetail = ref(state.isLoadingDetail)
  const error = ref(state.error)
  const detailError = ref(state.detailError)
  const filters = ref(state.filters)
  const search = ref(state.search)
  const sortBy = ref(state.sortBy)
  const sortDir = ref(state.sortDir)
  const pagination = ref(state.pagination)

  let listAbortController: AbortController | null = null
  let detailAbortController: AbortController | null = null

  const activeFilterCount = computed(() => {
    const f = filters.value
    let count = 0
    if (f.status.length) count++
    if (f.amountMin !== null) count++
    if (f.amountMax !== null) count++
    if (f.dateFrom) count++
    if (f.dateTo) count++
    if (f.accountName.trim()) count++
    if (f.dealName.trim()) count++
    return count
  })

  const hasActiveFilters = computed(() => activeFilterCount.value > 0 || search.value.trim() !== '')

  async function fetchDealsList(): Promise<void> {
    listAbortController?.abort()
    const controller = new AbortController()
    listAbortController = controller

    isLoading.value = true
    error.value = null
    try {
      const response = await fetchDeals(
        filters.value,
        search.value,
        { page: pagination.value.page, pageSize: pagination.value.pageSize },
        sortBy.value || undefined,
        sortDir.value,
        controller.signal,
      )
      deals.value = response.data
      pagination.value.total = response.pagination.total
    } catch (err) {
      if (isRequestAborted(err)) return
      error.value = toStoreError(err, 'deals.errors.loadFailed')
    } finally {
      if (listAbortController === controller) isLoading.value = false
    }
  }

  function selectDeal(id: string): void {
    selectedDealId.value = id
    fetchDealDetail(id)
  }

  function clearSelectedDeal(): void {
    selectedDealId.value = null
    currentDeal.value = null
    detailError.value = null
  }

  async function fetchDealDetail(id: string): Promise<void> {
    detailAbortController?.abort()
    const controller = new AbortController()
    detailAbortController = controller

    isLoadingDetail.value = true
    detailError.value = null
    try {
      currentDeal.value = await fetchDealById(id, controller.signal)
    } catch (err) {
      if (isRequestAborted(err)) return
      detailError.value = toStoreError(err, 'deals.errors.loadDetailFailed')
      currentDeal.value = null
    } finally {
      if (detailAbortController === controller) isLoadingDetail.value = false
    }
  }

  function applyFilters(newFilters: Partial<DealFilters>): void {
    filters.value = { ...filters.value, ...newFilters }
    pagination.value.page = 1
  }

  function clearFilters(): void {
    filters.value = defaultFilters()
    pagination.value.page = 1
  }

  function setSearch(query: string): void {
    search.value = query
    pagination.value.page = 1
  }

  function setSort(column: keyof Deal): void {
    if (sortBy.value === column) {
      sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortBy.value = column
      sortDir.value = 'asc'
    }
    pagination.value.page = 1
  }

  function setPage(page: number): void {
    pagination.value.page = page
  }

  function setPageSize(size: number): void {
    pagination.value.pageSize = size
    pagination.value.page = 1
  }

  function mergeDeals(incoming: Deal[]): void {
    const merged = deduplicateDeals([...deals.value, ...incoming])
    deals.value = merged
    invalidateDealsCache()
  }

  function invalidateCache(): void {
    invalidateDealsCache()
  }

  function $reset(): void {
    listAbortController?.abort()
    listAbortController = null
    detailAbortController?.abort()
    detailAbortController = null
    const fresh = initialState()
    deals.value = fresh.deals
    currentDeal.value = fresh.currentDeal
    selectedDealId.value = fresh.selectedDealId
    isLoading.value = fresh.isLoading
    isLoadingDetail.value = fresh.isLoadingDetail
    error.value = fresh.error
    detailError.value = fresh.detailError
    filters.value = fresh.filters
    search.value = fresh.search
    sortBy.value = fresh.sortBy
    sortDir.value = fresh.sortDir
    pagination.value = fresh.pagination
  }

  return {
    deals,
    currentDeal,
    selectedDealId,
    isLoading,
    isLoadingDetail,
    error,
    detailError,
    filters,
    search,
    sortBy,
    sortDir,
    pagination,
    activeFilterCount,
    hasActiveFilters,
    fetchDealsList,
    fetchDealDetail,
    selectDeal,
    clearSelectedDeal,
    applyFilters,
    clearFilters,
    setSearch,
    setSort,
    setPage,
    setPageSize,
    mergeDeals,
    invalidateCache,
    $reset,
  }
})
