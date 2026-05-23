import type { NavigationGuard } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { ROUTE_NAMES } from './routes'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAdmin?: boolean
  }
}

export const adminGuard: NavigationGuard = (to) => {
  if (to.meta.requiresAdmin && !useAuthStore().isAdmin) {
    return { name: ROUTE_NAMES.DEALS }
  }
}
