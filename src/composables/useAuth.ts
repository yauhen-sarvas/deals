import { useAuthStore } from '@/stores/auth.store'
import { useDealsStore } from '@/stores/deals.store'

export function useAuth() {
  const authStore = useAuthStore()
  const dealsStore = useDealsStore()

  function switchToAdmin() {
    authStore.switchUser('admin')
    dealsStore.clearFilters()
    dealsStore.fetchDealsList()
  }

  function switchToPartner() {
    authStore.switchUser('partner')
    dealsStore.clearFilters()
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
