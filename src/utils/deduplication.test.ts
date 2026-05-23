import { describe, it, expect } from 'vitest'
import { deduplicateDeals } from './deduplication'
import type { Deal } from '@/types/deals.types'

function makeDeal(partial: Partial<Deal> & { dealId: string }): Deal {
  return {
    dealName: 'Test Deal',
    accountName: 'Test Co',
    status: 'Open',
    amount: 1000,
    createdDate: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-06-01T00:00:00.000Z',
    ...partial,
  }
}

describe('deduplicateDeals', () => {
  it('returns empty array for empty input', () => {
    expect(deduplicateDeals([])).toEqual([])
  })

  it('returns same deals when no duplicates', () => {
    const deals = [makeDeal({ dealId: 'a' }), makeDeal({ dealId: 'b' })]
    expect(deduplicateDeals(deals)).toHaveLength(2)
  })

  it('removes duplicate by dealId', () => {
    const deals = [makeDeal({ dealId: 'a' }), makeDeal({ dealId: 'a' })]
    expect(deduplicateDeals(deals)).toHaveLength(1)
  })

  it('keeps the record with the later updatedAt when duplicates exist', () => {
    const older = makeDeal({ dealId: 'a', dealName: 'Old', updatedAt: '2024-01-01T00:00:00.000Z' })
    const newer = makeDeal({ dealId: 'a', dealName: 'New', updatedAt: '2024-06-01T00:00:00.000Z' })
    const result = deduplicateDeals([older, newer])
    expect(result[0].dealName).toBe('New')
  })

  it('keeps newer even when it appears first in the array', () => {
    const newer = makeDeal({ dealId: 'a', dealName: 'New', updatedAt: '2024-06-01T00:00:00.000Z' })
    const older = makeDeal({ dealId: 'a', dealName: 'Old', updatedAt: '2024-01-01T00:00:00.000Z' })
    const result = deduplicateDeals([newer, older])
    expect(result[0].dealName).toBe('New')
  })

  it('preserves insertion order for unique deals', () => {
    const deals = [
      makeDeal({ dealId: 'c' }),
      makeDeal({ dealId: 'a' }),
      makeDeal({ dealId: 'b' }),
    ]
    const result = deduplicateDeals(deals)
    expect(result.map((d) => d.dealId)).toEqual(['c', 'a', 'b'])
  })

  it('handles mix of unique and duplicate deals', () => {
    const deals = [
      makeDeal({ dealId: 'a', dealName: 'A-old', updatedAt: '2024-01-01T00:00:00.000Z' }),
      makeDeal({ dealId: 'b' }),
      makeDeal({ dealId: 'a', dealName: 'A-new', updatedAt: '2024-06-01T00:00:00.000Z' }),
    ]
    const result = deduplicateDeals(deals)
    expect(result).toHaveLength(2)
    expect(result.find((d) => d.dealId === 'a')?.dealName).toBe('A-new')
  })

  it('returns a new array and does not mutate input', () => {
    const input = [makeDeal({ dealId: 'a' })]
    const result = deduplicateDeals(input)
    expect(result).not.toBe(input)
  })
})
