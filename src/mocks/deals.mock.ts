import { faker } from '@faker-js/faker'
import type { Deal, DealStatus } from '@/types/deals.types'
import { FAKER_SEED, MOCK_DEALS_COUNT, MOCK_AMOUNT_MIN, MOCK_AMOUNT_MAX, MOCK_DATE_FROM, MOCK_DATE_TO } from './config'

faker.seed(FAKER_SEED)

const STATUSES: DealStatus[] = ['Open', 'Approved', 'Rejected']
const PARTNER_IDS = ['user-partner-1', 'user-partner-2', 'user-partner-3', null]

function randomDate(start: Date, end: Date): string {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString()
}

export const MOCK_DEALS: Deal[] = Array.from({ length: MOCK_DEALS_COUNT }, (_, i) => {
  const createdDate = randomDate(MOCK_DATE_FROM, MOCK_DATE_TO)
  const updatedAt = randomDate(new Date(createdDate), new Date())
  const partnerId = PARTNER_IDS[Math.floor(Math.random() * PARTNER_IDS.length)]

  return {
    dealId: `deal-${String(i + 1).padStart(4, '0')}`,
    dealName: faker.commerce.productName() + ' Deal',
    accountName: faker.company.name(),
    status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
    amount: Math.round(faker.number.float({ min: MOCK_AMOUNT_MIN, max: MOCK_AMOUNT_MAX, fractionDigits: 2 }) * 100) / 100,
    createdDate,
    updatedAt,
    assignedPartnerId: partnerId ?? undefined,
  }
})
