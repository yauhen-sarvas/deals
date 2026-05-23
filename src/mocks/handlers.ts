import { http, HttpResponse, delay } from 'msw'
import { MOCK_DEALS } from './deals.mock'
import { HTTP_CODES } from '@/constants/http'
import {
  ERROR_PROBABILITY,
  TIMEOUT_PROBABILITY,
  SIMULATED_TIMEOUT_MS,
  RESPONSE_DELAY_MIN_MS,
  RESPONSE_DELAY_RANGE_MS,
  DETAIL_DELAY_MIN_MS,
  DETAIL_DELAY_RANGE_MS,
  END_OF_DAY_SUFFIX,
} from './config'
import type { Deal } from '@/types/deals.types'

function shouldSimulateError(): boolean {
  return Math.random() < ERROR_PROBABILITY
}

function shouldSimulateTimeout(): boolean {
  return Math.random() < TIMEOUT_PROBABILITY
}

function filterDeals(deals: Deal[], params: URLSearchParams, userId?: string, role?: string): Deal[] {
  let result = [...deals]

  if (role === 'Partner' && userId) {
    result = result.filter((d) => d.assignedPartnerId === userId)
  }

  const statusParam = params.getAll('status')
  if (statusParam.length) {
    result = result.filter((d) => statusParam.includes(d.status))
  }

  const amountMin = params.get('amountMin')
  if (amountMin !== null) {
    result = result.filter((d) => d.amount >= parseFloat(amountMin))
  }

  const amountMax = params.get('amountMax')
  if (amountMax !== null) {
    result = result.filter((d) => d.amount <= parseFloat(amountMax))
  }

  const dateFrom = params.get('dateFrom')
  if (dateFrom) {
    result = result.filter((d) => d.createdDate >= dateFrom)
  }

  const dateTo = params.get('dateTo')
  if (dateTo) {
    result = result.filter((d) => d.createdDate <= dateTo + END_OF_DAY_SUFFIX)
  }

  const accountName = params.get('accountName')
  if (accountName) {
    const lower = accountName.toLowerCase()
    result = result.filter((d) => d.accountName.toLowerCase().includes(lower))
  }

  const dealName = params.get('dealName')
  if (dealName) {
    const lower = dealName.toLowerCase()
    result = result.filter((d) => d.dealName.toLowerCase().includes(lower))
  }

  const search = params.get('search')
  if (search) {
    const lower = search.toLowerCase().trim()
    result = result.filter(
      (d) =>
        d.dealName.toLowerCase().includes(lower) ||
        d.accountName.toLowerCase().includes(lower) ||
        d.status.toLowerCase().includes(lower) ||
        d.dealId.toLowerCase().includes(lower),
    )
  }

  const sortBy = params.get('sortBy') as keyof Deal | null
  const sortDir = params.get('sortDir') ?? 'asc'
  if (sortBy && sortBy in result[0]) {
    result.sort((a, b) => {
      const av = a[sortBy]
      const bv = b[sortBy]
      if (av === undefined || bv === undefined) return 0
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }

  return result
}

export const handlers = [
  http.get('/api/deals', async ({ request }) => {
    if (shouldSimulateTimeout()) {
      await delay(SIMULATED_TIMEOUT_MS)
    }
    if (shouldSimulateError()) {
      return HttpResponse.json({ message: 'Internal Server Error', code: 'SERVER_ERROR', status: HTTP_CODES.INTERNAL_SERVER_ERROR }, { status: HTTP_CODES.INTERNAL_SERVER_ERROR })
    }

    await delay(RESPONSE_DELAY_MIN_MS + Math.random() * RESPONSE_DELAY_RANGE_MS)

    const url = new URL(request.url)
    const params = url.searchParams

    const userId = request.headers.get('x-user-id') ?? undefined
    const role = request.headers.get('x-user-role') ?? undefined

    const page = parseInt(params.get('page') ?? '1', 10)
    const pageSize = parseInt(params.get('pageSize') ?? '20', 10)

    const filtered = filterDeals(MOCK_DEALS, params, userId, role)
    const total = filtered.length
    const start = (page - 1) * pageSize
    const data = filtered.slice(start, start + pageSize)

    return HttpResponse.json({
      data,
      pagination: { page, pageSize, total },
    })
  }),

  http.get('/api/deals/:id', async ({ params, request }) => {
    if (shouldSimulateTimeout()) {
      await delay(SIMULATED_TIMEOUT_MS)
    }
    if (shouldSimulateError()) {
      return HttpResponse.json({ message: 'Internal Server Error', code: 'SERVER_ERROR', status: HTTP_CODES.INTERNAL_SERVER_ERROR }, { status: HTTP_CODES.INTERNAL_SERVER_ERROR })
    }

    await delay(DETAIL_DELAY_MIN_MS + Math.random() * DETAIL_DELAY_RANGE_MS)

    const { id } = params as { id: string }
    const userId = request.headers.get('x-user-id') ?? undefined
    const role = request.headers.get('x-user-role') ?? undefined

    const deal = MOCK_DEALS.find((d) => d.dealId === id)
    if (!deal) {
      return HttpResponse.json({ message: 'Deal not found', code: 'NOT_FOUND', status: HTTP_CODES.NOT_FOUND }, { status: HTTP_CODES.NOT_FOUND })
    }

    if (role === 'Partner' && userId && deal.assignedPartnerId !== userId) {
      return HttpResponse.json({ message: 'Forbidden', code: 'FORBIDDEN', status: HTTP_CODES.FORBIDDEN }, { status: HTTP_CODES.FORBIDDEN })
    }

    return HttpResponse.json(deal)
  }),
]
