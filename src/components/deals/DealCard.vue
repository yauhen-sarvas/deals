<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import DealStatusBadge from './DealStatusBadge.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { computeSmartTags, SMART_TAG_COLORS, SMART_TAG_I18N_KEYS } from '@/utils/smartTags'
import type { SmartTag } from '@/utils/smartTags'
import type { Deal } from '@/types/deals.types'
import { ROUTE_NAMES } from '@/router/routes'

const props = defineProps<{ deal: Deal }>()
const { t, locale } = useI18n()
const router = useRouter()

const tags = computed(() => computeSmartTags(props.deal))

function navigate() {
  router.push({ name: ROUTE_NAMES.DEAL_DETAIL, params: { id: props.deal.dealId } })
}

function tagLabel(tag: SmartTag): string {
  return t(SMART_TAG_I18N_KEYS[tag] as string)
}
</script>

<template>
  <div
    class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm cursor-pointer
           hover:border-blue-400 hover:shadow-md transition-all active:scale-[0.99]"
    role="button"
    tabindex="0"
    @click="navigate"
    @keydown.enter="navigate"
  >
    <div class="flex items-start justify-between gap-2 mb-3">
      <div class="min-w-0">
        <p class="font-semibold text-gray-900 truncate">{{ deal.dealName }}</p>
        <p class="text-sm text-gray-500 truncate">{{ deal.accountName }}</p>
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
