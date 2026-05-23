import type { Deal } from '@/types/deals.types'

/**
 * Deduplicates deals by dealId.
 * When duplicates exist, keeps the record with the later updatedAt timestamp.
 */
export function deduplicateDeals(deals: Deal[]): Deal[] {
  const map = new Map<string, Deal>()
  for (const deal of deals) {
    const existing = map.get(deal.dealId)
    if (!existing || new Date(deal.updatedAt) > new Date(existing.updatedAt)) {
      map.set(deal.dealId, deal)
    }
  }
  return Array.from(map.values())
}
