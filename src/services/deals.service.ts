import { apiClient } from './api.service'
import { cacheService } from './cache.service'
import type { Deal, DealsApiResponse, DealFilters, PaginationMeta } from '@/types/deals.types'
import { CACHE_TTL_MS } from '@/constants/cache'

function buildQueryParams(
  filters: DealFilters,
  search: string,
  pagination: Pick<PaginationMeta, 'page' | 'pageSize'>,
  sortBy?: string,
  sortDir?: 'asc' | 'desc',
): Record<string, string | string[]> {
  const params: Record<string, string | string[]> = {
    page: String(pagination.page),
    pageSize: String(pagination.pageSize),
  }

  if (filters.status.length) params['status'] = filters.status
  if (filters.amountMin !== null) params['amountMin'] = String(filters.amountMin)
  if (filters.amountMax !== null) params['amountMax'] = String(filters.amountMax)
  if (filters.dateFrom) params['dateFrom'] = filters.dateFrom
  if (filters.dateTo) params['dateTo'] = filters.dateTo
  if (filters.accountName.trim()) params['accountName'] = filters.accountName.trim()
  if (filters.dealName.trim()) params['dealName'] = filters.dealName.trim()
  if (search.trim()) params['search'] = search.trim()
  if (sortBy) params['sortBy'] = sortBy
  if (sortDir) params['sortDir'] = sortDir

  return params
}

function cacheKey(params: Record<string, string | string[]>): string {
  return 'deals:' + JSON.stringify(params, Object.keys(params).sort())
}

export async function fetchDeals(
  filters: DealFilters,
  search: string,
  pagination: Pick<PaginationMeta, 'page' | 'pageSize'>,
  sortBy?: string,
  sortDir?: 'asc' | 'desc',
  signal?: AbortSignal,
): Promise<DealsApiResponse> {
  const params = buildQueryParams(filters, search, pagination, sortBy, sortDir)
  const key = cacheKey(params)

  const cached = cacheService.get<DealsApiResponse>(key)
  if (cached) return cached

  const response = await apiClient.get<DealsApiResponse>('/api/deals', { params, signal })
  cacheService.set(key, response.data, CACHE_TTL_MS)
  return response.data
}

export async function fetchDealById(id: string, signal?: AbortSignal): Promise<Deal> {
  const key = `deal:${id}`
  const cached = cacheService.get<Deal>(key)
  if (cached) return cached

  const response = await apiClient.get<Deal>(`/api/deals/${id}`, { signal })
  cacheService.set(key, response.data, CACHE_TTL_MS)
  return response.data
}

export function invalidateDealsCache(): void {
  cacheService.invalidate('deals:')
  cacheService.invalidate('deal:')
}
