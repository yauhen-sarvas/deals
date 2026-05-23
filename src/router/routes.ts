export const ROUTE_NAMES = {
  DEALS: 'deals',
  DEAL_DETAIL: 'deal-detail',
  ADMIN: 'admin',
} as const

export type RouteName = (typeof ROUTE_NAMES)[keyof typeof ROUTE_NAMES]
