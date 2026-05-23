import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { computeSmartTags } from './smartTags'
import {
  HIGH_VALUE_THRESHOLD,
  LARGE_ENTERPRISE_THRESHOLD,
  RECENTLY_CREATED_DAYS,
  STALE_DEAL_DAYS,
} from '@/constants/smartTags'
import type { Deal } from '@/types/deals.types'

const MS_PER_DAY = 86_400_000

function makeDeal(partial: Partial<Deal> = {}): Deal {
  return {
    dealId: 'deal-001',
    dealName: 'Test Deal',
    accountName: 'Test Co',
    status: 'Open',
    amount: 1000,
    createdDate: new Date(Date.now() - 15 * MS_PER_DAY).toISOString(),
    updatedAt: new Date().toISOString(),
    ...partial,
  }
}

describe('computeSmartTags', () => {
  it('returns no tags for an average deal', () => {
    const deal = makeDeal({ amount: 1000, status: 'Open' })
    expect(computeSmartTags(deal)).toEqual([])
  })

  it('tags High Value when amount exceeds threshold', () => {
    const deal = makeDeal({ amount: HIGH_VALUE_THRESHOLD + 1 })
    expect(computeSmartTags(deal)).toContain('High Value')
  })

  it('does not tag High Value at exactly threshold', () => {
    const deal = makeDeal({ amount: HIGH_VALUE_THRESHOLD })
    expect(computeSmartTags(deal)).not.toContain('High Value')
  })

  it('tags Large Enterprise when amount exceeds large threshold', () => {
    const deal = makeDeal({ amount: LARGE_ENTERPRISE_THRESHOLD + 1 })
    const tags = computeSmartTags(deal)
    expect(tags).toContain('High Value')
    expect(tags).toContain('Large Enterprise')
  })

  it('tags Recently Created when created within threshold days', () => {
    const recentDate = new Date(Date.now() - (RECENTLY_CREATED_DAYS - 1) * MS_PER_DAY).toISOString()
    const deal = makeDeal({ createdDate: recentDate })
    expect(computeSmartTags(deal)).toContain('Recently Created')
  })

  it('does not tag Recently Created when created beyond threshold days', () => {
    const oldDate = new Date(Date.now() - (RECENTLY_CREATED_DAYS + 1) * MS_PER_DAY).toISOString()
    const deal = makeDeal({ createdDate: oldDate })
    expect(computeSmartTags(deal)).not.toContain('Recently Created')
  })

  it('tags Stale Deal for Open deals older than stale threshold', () => {
    const staleDate = new Date(Date.now() - (STALE_DEAL_DAYS + 1) * MS_PER_DAY).toISOString()
    const deal = makeDeal({ status: 'Open', createdDate: staleDate })
    expect(computeSmartTags(deal)).toContain('Stale Deal')
  })

  it('does not tag Stale Deal for Approved deals even if old', () => {
    const staleDate = new Date(Date.now() - (STALE_DEAL_DAYS + 1) * MS_PER_DAY).toISOString()
    const deal = makeDeal({ status: 'Approved', createdDate: staleDate })
    expect(computeSmartTags(deal)).not.toContain('Stale Deal')
  })

  it('does not tag Stale Deal for Rejected deals even if old', () => {
    const staleDate = new Date(Date.now() - (STALE_DEAL_DAYS + 1) * MS_PER_DAY).toISOString()
    const deal = makeDeal({ status: 'Rejected', createdDate: staleDate })
    expect(computeSmartTags(deal)).not.toContain('Stale Deal')
  })

  it('can return multiple tags simultaneously', () => {
    const recentDate = new Date(Date.now() - 1 * MS_PER_DAY).toISOString()
    const deal = makeDeal({ amount: LARGE_ENTERPRISE_THRESHOLD + 1, createdDate: recentDate })
    const tags = computeSmartTags(deal)
    expect(tags).toContain('High Value')
    expect(tags).toContain('Large Enterprise')
    expect(tags).toContain('Recently Created')
  })
})
