import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDealsStore, defaultFilters } from '@/stores/deals.store'
import { useUiStore } from '@/stores/ui.store'
import type { DealFilters, DealStatus } from '@/types/deals.types'

export function useFilters() {
  const store = useDealsStore()
  const uiStore = useUiStore()
  const { t } = useI18n()

  const localFilters = ref<DealFilters>({ ...store.filters })

  const amountError = computed(() => {
    const { amountMin, amountMax } = localFilters.value
    if (amountMin !== null && amountMax !== null && amountMin > amountMax) {
      return t('deals.filters.amountError')
    }
    return null
  })

  function toggleStatus(status: DealStatus) {
    const idx = localFilters.value.status.indexOf(status)
    if (idx >= 0) {
      localFilters.value.status = localFilters.value.status.filter((s) => s !== status)
    } else {
      localFilters.value.status = [...localFilters.value.status, status]
    }
  }

  function applyFilters() {
    if (amountError.value) return
    store.applyFilters(localFilters.value)
    uiStore.closeFilters()
    store.fetchDealsList()
  }

  function clearFilters() {
    localFilters.value = defaultFilters()
    store.clearFilters()
    uiStore.closeFilters()
    store.fetchDealsList()
  }

  function syncFromStore() {
    localFilters.value = { ...store.filters }
  }

  return { localFilters, amountError, toggleStatus, applyFilters, clearFilters, syncFromStore }
}
