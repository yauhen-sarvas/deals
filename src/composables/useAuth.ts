import { useAuthStore } from '@/stores/auth.store'
import { useDealsStore } from '@/stores/deals.store'

export function useAuth() {
  const authStore = useAuthStore()
  const dealsStore = useDealsStore()

  function switchToAdmin() {
    dealsStore.clearSelectedDeal()
    dealsStore.invalidateCache()
    authStore.switchUser('admin')
    dealsStore.clearFilters()
    dealsStore.setSearch('')
    dealsStore.fetchDealsList()
  }

  function switchToPartner() {
    dealsStore.clearSelectedDeal()
    dealsStore.invalidateCache()
    authStore.switchUser('partner')
    dealsStore.clearFilters()
    dealsStore.setSearch('')
    dealsStore.fetchDealsList()
  }

  return {
    currentUser: authStore.currentUser,
    isAdmin: authStore.isAdmin,
    isPartner: authStore.isPartner,
    currentRole: authStore.currentRole,
    switchToAdmin,
    switchToPartner,
  }
}
