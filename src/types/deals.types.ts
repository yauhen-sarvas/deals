export type DealStatus = 'Open' | 'Approved' | 'Rejected'

export type Role = 'Admin' | 'Partner'

export interface Deal {
  dealId: string
  dealName: string
  accountName: string
  status: DealStatus
  amount: number
  createdDate: string
  updatedAt: string
  assignedPartnerId?: string
}

export interface DealFilters {
  status: DealStatus[]
  amountMin: number | null
  amountMax: number | null
  dateFrom: string | null
  dateTo: string | null
  accountName: string
  dealName: string
}

export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
}

export interface DealsApiResponse {
  data: Deal[]
  pagination: PaginationMeta
}

export interface ApiError {
  message: string
  code: string
  status: number
}

export interface StoreError {
  message: string
  status?: number
}

export interface MockUser {
  id: string
  role: Role
  name: string
}
