<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import DealStatusBadge from './DealStatusBadge.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { computeSmartTags, SMART_TAG_COLORS, SMART_TAG_I18N_KEYS } from '@/utils/smartTags'
import type { SmartTag } from '@/utils/smartTags'
import type { Deal } from '@/types/deals.types'
import { useDealsStore } from '@/stores/deals.store'

const props = defineProps<{ deal: Deal }>()
const { t, locale } = useI18n()
const store = useDealsStore()

const tags = computed(() => computeSmartTags(props.deal))

function tagLabel(tag: SmartTag): string {
  return t(SMART_TAG_I18N_KEYS[tag])
}
</script>

<template>
  <div
    class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm cursor-pointer
           hover:border-blue-400 hover:shadow-md transition-all active:scale-[0.99]
           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    role="button"
    tabindex="0"
    :aria-label="deal.dealName"
    @click="store.selectDeal(deal.dealId)"
    @keydown.enter="store.selectDeal(deal.dealId)"
  >
    <div class="flex items-start justify-between gap-2 mb-3">
      <div class="min-w-0">
        <p class="font-semibold text-gray-900 truncate" :title="deal.dealName">{{ deal.dealName }}</p>
        <p class="text-sm text-gray-500 truncate" :title="deal.accountName">{{ deal.accountName }}</p>
      </div>
      <DealStatusBadge :status="deal.status" />
    </div>

    <div class="flex items-center justify-between text-sm">
      <span class="font-medium text-gray-900">{{ formatCurrency(deal.amount, locale) }}</span>
      <span class="text-gray-400">{{ formatDate(deal.createdDate, locale) }}</span>
    </div>

    <div v-if="tags.length" class="mt-3 flex flex-wrap gap-1">
      <AppBadge
        v-for="tag in tags"
        :key="tag"
        variant="custom"
        :custom-class="SMART_TAG_COLORS[tag]"
      >{{ tagLabel(tag) }}</AppBadge>
    </div>
  </div>
</template>
