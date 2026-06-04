import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDealsStore, defaultFilters } from '@/stores/deals.store'
import { useUiStore } from '@/stores/ui.store'
import type { DealFilters, DealStatus } from '@/types/deals.types'

export function useFilters() {
  const store = useDealsStore()
  const uiStore = useUiStore()
  const { t } = useI18n()

  const localFilters = ref<DealFilters>({ ...store.filters })

  watch(() => store.filters, syncFromStore, { deep: true })

  const amountError = computed(() => {
    const { amountMin, amountMax } = localFilters.value
    if (amountMin !== null && amountMax !== null && amountMin > amountMax) {
      return t('deals.filters.amountError')
    }
    return null
  })

  const dateError = computed(() => {
    const { dateFrom, dateTo } = localFilters.value
    if (dateFrom && dateTo && dateFrom > dateTo) {
      return t('deals.filters.dateError')
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
    if (amountError.value || dateError.value) return
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

  return { localFilters, amountError, dateError, toggleStatus, applyFilters, clearFilters }
}
