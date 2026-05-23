<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AppBadge from '@/components/ui/AppBadge.vue'
import type { DealStatus } from '@/types/deals.types'

const props = defineProps<{ status: DealStatus }>()
const { t } = useI18n()

const variant = computed(() => {
  switch (props.status) {
    case 'Approved': return 'success'
    case 'Rejected': return 'danger'
    default: return 'info'
  }
})
</script>

<template>
  <AppBadge :variant="variant">{{ t(`deals.status.${status}`) }}</AppBadge>
</template>
