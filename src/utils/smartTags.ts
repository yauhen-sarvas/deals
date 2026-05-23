import type { Deal } from '@/types/deals.types'
import {
  HIGH_VALUE_THRESHOLD,
  LARGE_ENTERPRISE_THRESHOLD,
  RECENTLY_CREATED_DAYS,
  STALE_DEAL_DAYS,
} from '@/constants/smartTags'

const MS_PER_DAY = 86_400_000

export type SmartTag = 'High Value' | 'Recently Created' | 'Stale Deal' | 'Large Enterprise'

export function computeSmartTags(deal: Deal): SmartTag[] {
  const tags: SmartTag[] = []
  const daysSinceCreated = (Date.now() - new Date(deal.createdDate).getTime()) / MS_PER_DAY

  if (deal.amount > HIGH_VALUE_THRESHOLD) tags.push('High Value')
  if (deal.amount > LARGE_ENTERPRISE_THRESHOLD) tags.push('Large Enterprise')
  if (daysSinceCreated < RECENTLY_CREATED_DAYS) tags.push('Recently Created')
  if (deal.status === 'Open' && daysSinceCreated > STALE_DEAL_DAYS) tags.push('Stale Deal')

  return tags
}

export const SMART_TAG_COLORS: Record<SmartTag, string> = {
  'High Value': 'bg-emerald-100 text-emerald-800',
  'Large Enterprise': 'bg-purple-100 text-purple-800',
  'Recently Created': 'bg-blue-100 text-blue-800',
  'Stale Deal': 'bg-amber-100 text-amber-800',
}

export const SMART_TAG_I18N_KEYS: Record<SmartTag, string> = {
  'High Value': 'smartTags.highValue',
  'Large Enterprise': 'smartTags.largeEnterprise',
  'Recently Created': 'smartTags.recentlyCreated',
  'Stale Deal': 'smartTags.staleDeal',
}
